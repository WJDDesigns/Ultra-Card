import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ucRecordStore,
  todoSupportsDescription,
  stripSummaryPayload,
  UC_RECORD_SUMMARY_SEP,
} from './uc-record-store';

const NS = 'plant_care';
const OTHER_NS = 'cleaning_zones';

interface TestPayload {
  plant_id: string;
  kind: string;
  count?: number;
}

function envelope(ns: string, data: unknown): string {
  return JSON.stringify({ _ns: ns, _v: 1, data });
}

/**
 * Minimal hass double. `todo.get_items` is called through
 * `callService(domain, service, data, target, returnResponse, returnResponse)`.
 */
function makeHass(options: { entityId: string; items: any[]; supportsDescription?: boolean }) {
  const calls: Array<{ domain: string; service: string; data: any }> = [];
  const hass: any = {
    states: {
      [options.entityId]: {
        state: '3',
        last_updated: '2026-08-01T00:00:00.000Z',
        // 64 = TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM
        attributes: { supported_features: options.supportsDescription === false ? 15 : 79 },
      },
    },
    callService: vi.fn(
      async (
        domain: string,
        service: string,
        data: any,
        _t?: any,
        _r?: any,
        wantsResponse?: any
      ) => {
        calls.push({ domain, service, data });
        if (service === 'get_items' && wantsResponse) {
          return { response: { [options.entityId]: { items: options.items } } };
        }
        return undefined;
      }
    ),
  };
  return { hass, calls };
}

describe('stripSummaryPayload', () => {
  it('removes a separator-packed payload', () => {
    expect(stripSummaryPayload(`Watered Fern${UC_RECORD_SUMMARY_SEP}{"a":1}`)).toBe('Watered Fern');
  });

  it('removes a trailing brace payload without a separator', () => {
    expect(stripSummaryPayload('Watered Fern {"a":1}')).toBe('Watered Fern');
  });

  it('leaves ordinary summaries untouched', () => {
    expect(stripSummaryPayload('  Buy milk  ')).toBe('Buy milk');
    expect(stripSummaryPayload('Fix {the} sink')).toBe('Fix {the} sink');
  });
});

describe('todoSupportsDescription', () => {
  it('reads the SET_DESCRIPTION_ON_ITEM feature bit', () => {
    const { hass } = makeHass({ entityId: 'todo.list', items: [] });
    expect(todoSupportsDescription(hass, 'todo.list')).toBe(true);
  });

  it('returns false for lists without the bit', () => {
    const { hass } = makeHass({
      entityId: 'todo.shopping',
      items: [],
      supportsDescription: false,
    });
    expect(todoSupportsDescription(hass, 'todo.shopping')).toBe(false);
  });

  it('returns false for unknown entities', () => {
    const { hass } = makeHass({ entityId: 'todo.list', items: [] });
    expect(todoSupportsDescription(hass, 'todo.missing')).toBe(false);
  });
});

describe('ucRecordStore.parseItem', () => {
  it('parses a description-packed record', () => {
    const record = ucRecordStore.parseItem<TestPayload>(
      {
        uid: 'a1',
        summary: 'Watered Fern',
        status: 'needs_action',
        description: envelope(NS, { plant_id: 'p1', kind: 'water' }),
      },
      NS
    );
    expect(record).toEqual({
      uid: 'a1',
      summary: 'Watered Fern',
      status: 'needs_action',
      due: undefined,
      payload: { plant_id: 'p1', kind: 'water' },
    });
  });

  it('parses a summary-packed record and strips the payload from the label', () => {
    const record = ucRecordStore.parseItem<TestPayload>(
      {
        uid: 'a2',
        summary: `Watered Fern${UC_RECORD_SUMMARY_SEP}${envelope(NS, { plant_id: 'p1', kind: 'water' })}`,
        status: 'completed',
      },
      NS
    );
    expect(record?.summary).toBe('Watered Fern');
    expect(record?.status).toBe('completed');
    expect(record?.payload.plant_id).toBe('p1');
  });

  it('ignores records belonging to a different namespace', () => {
    const record = ucRecordStore.parseItem(
      {
        uid: 'a3',
        summary: 'Cleaned Kitchen',
        status: 'completed',
        description: envelope(OTHER_NS, { zone_id: 'z1' }),
      },
      NS
    );
    expect(record).toBeNull();
  });

  it('ignores hand-typed items with no payload', () => {
    expect(
      ucRecordStore.parseItem({ uid: 'a4', summary: 'Buy soil', status: 'needs_action' }, NS)
    ).toBeNull();
  });

  it('ignores items with malformed JSON', () => {
    expect(
      ucRecordStore.parseItem(
        { uid: 'a5', summary: 'Broken', status: 'needs_action', description: '{not json' },
        NS
      )
    ).toBeNull();
  });

  it('ignores items with no uid, since they cannot be updated later', () => {
    expect(
      ucRecordStore.parseItem(
        { summary: 'No uid', status: 'needs_action', description: envelope(NS, { a: 1 }) },
        NS
      )
    ).toBeNull();
  });
});

describe('ucRecordStore.getRecords', () => {
  beforeEach(() => {
    // The underlying todo service caches on the hass object, so each test uses a fresh one.
  });

  it('returns only records in the requested namespace', async () => {
    const { hass } = makeHass({
      entityId: 'todo.mixed',
      items: [
        {
          uid: '1',
          summary: 'Mine',
          status: 'completed',
          description: envelope(NS, { plant_id: 'p1' }),
        },
        {
          uid: '2',
          summary: 'Theirs',
          status: 'completed',
          description: envelope(OTHER_NS, { zone_id: 'z' }),
        },
        { uid: '3', summary: 'Hand typed', status: 'needs_action' },
      ],
    });
    const records = await ucRecordStore.getRecords<TestPayload>(hass, 'todo.mixed', NS);
    expect(records).toHaveLength(1);
    expect(records[0]!.uid).toBe('1');
  });

  it('returns an empty array without an entity', async () => {
    const { hass } = makeHass({ entityId: 'todo.x', items: [] });
    expect(await ucRecordStore.getRecords(hass, '', NS)).toEqual([]);
  });
});

describe('ucRecordStore.addRecord', () => {
  it('puts the payload in the description when the list supports it', async () => {
    const { hass, calls } = makeHass({ entityId: 'todo.local', items: [] });
    await ucRecordStore.addRecord(hass, 'todo.local', NS, 'Watered Fern', {
      plant_id: 'p1',
      kind: 'water',
    });

    const add = calls.find(c => c.service === 'add_item');
    expect(add?.data.item).toBe('Watered Fern');
    expect(JSON.parse(add?.data.description)).toEqual({
      _ns: NS,
      _v: 1,
      data: { plant_id: 'p1', kind: 'water' },
    });
  });

  it('falls back to packing the payload into the summary', async () => {
    const { hass, calls } = makeHass({
      entityId: 'todo.shopping',
      items: [],
      supportsDescription: false,
    });
    await ucRecordStore.addRecord(hass, 'todo.shopping', NS, 'Watered Fern', { plant_id: 'p1' });

    const add = calls.find(c => c.service === 'add_item');
    expect(add?.data.description).toBeUndefined();
    expect(add?.data.item).toContain(UC_RECORD_SUMMARY_SEP);
    expect(stripSummaryPayload(add!.data.item)).toBe('Watered Fern');
  });

  it('passes a due date through when supplied', async () => {
    const { hass, calls } = makeHass({ entityId: 'todo.local', items: [] });
    await ucRecordStore.addRecord(
      hass,
      'todo.local',
      NS,
      'Due soon',
      { plant_id: 'p1' },
      {
        due: '2026-09-01T09:00:00',
      }
    );
    expect(calls.find(c => c.service === 'add_item')?.data.due_datetime).toBe(
      '2026-09-01T09:00:00'
    );
  });
});

describe('ucRecordStore.patchRecord', () => {
  it('merges into the existing payload rather than replacing it', async () => {
    const { hass, calls } = makeHass({
      entityId: 'todo.local',
      items: [
        {
          uid: 'u1',
          summary: 'Fern',
          status: 'needs_action',
          description: envelope(NS, { plant_id: 'p1', kind: 'water', count: 3 }),
        },
      ],
    });

    await ucRecordStore.patchRecord<TestPayload>(hass, 'todo.local', NS, 'u1', {
      payload: { count: 4 },
      status: 'completed',
    });

    const update = calls.find(c => c.service === 'update_item');
    expect(update?.data.item).toBe('u1');
    expect(update?.data.status).toBe('completed');
    expect(JSON.parse(update!.data.description).data).toEqual({
      plant_id: 'p1',
      kind: 'water',
      count: 4,
    });
    // Summary is preserved when the patch doesn't rename.
    expect(update?.data.rename).toBe('Fern');
  });

  it('does nothing when the uid is not one of ours', async () => {
    const { hass, calls } = makeHass({
      entityId: 'todo.local',
      items: [{ uid: 'other', summary: 'Hand typed', status: 'needs_action' }],
    });
    await ucRecordStore.patchRecord<TestPayload>(hass, 'todo.local', NS, 'missing', {
      payload: { count: 1 },
    });
    expect(calls.find(c => c.service === 'update_item')).toBeUndefined();
  });
});

describe('ucRecordStore mutations', () => {
  it('setStatus updates only the status', async () => {
    const { hass, calls } = makeHass({ entityId: 'todo.local', items: [] });
    await ucRecordStore.setStatus(hass, 'todo.local', 'u1', 'completed');
    const update = calls.find(c => c.service === 'update_item');
    expect(update?.data).toEqual({ entity_id: 'todo.local', item: 'u1', status: 'completed' });
  });

  it('removeRecord calls todo.remove_item', async () => {
    const { hass, calls } = makeHass({ entityId: 'todo.local', items: [] });
    await ucRecordStore.removeRecord(hass, 'todo.local', 'u1');
    const remove = calls.find(c => c.service === 'remove_item');
    expect(remove?.data).toEqual({ entity_id: 'todo.local', item: 'u1' });
  });

  it('ignores mutations with missing arguments', async () => {
    const { hass, calls } = makeHass({ entityId: 'todo.local', items: [] });
    await ucRecordStore.setStatus(hass, '', 'u1', 'completed');
    await ucRecordStore.removeRecord(hass, 'todo.local', '');
    expect(calls).toHaveLength(0);
  });
});
