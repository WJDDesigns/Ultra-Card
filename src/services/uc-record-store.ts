import { HomeAssistant } from 'custom-card-helpers';
import { UltraCardTodoService, TodoItem } from './uc-todo-service';

/**
 * Generic "to-do list as a tiny database" store.
 *
 * Several Pro modules need to persist structured records without asking users
 * to install a backend. A Local To-do helper is the closest thing Home
 * Assistant ships: it is user-creatable, survives restarts, syncs to every
 * client, and already has a UI. This store packs JSON into the item description
 * (falling back to a suffix on the summary for lists that don't support
 * descriptions, e.g. Shopping List) and hides that plumbing from callers.
 *
 * Records are namespaced so one list can safely back more than one module, and
 * so items a user typed in by hand are ignored rather than mangled.
 */

/** Separator used when packing JSON into the summary of a description-less list. */
export const UC_RECORD_SUMMARY_SEP = ' ⌗';

/** TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM */
const TODO_FEATURE_SET_DESCRIPTION = 64;

export interface UcStoredRecord<T> {
  uid: string;
  /** Human-readable label with any packed payload stripped off. */
  summary: string;
  status: 'needs_action' | 'completed';
  due?: string | undefined;
  payload: T;
}

interface Envelope {
  /** Namespace tag, e.g. `plant_care`. */
  _ns: string;
  /** Envelope schema version, for future migrations. */
  _v: number;
  data: unknown;
}

/** True when the list supports per-item descriptions (preferred payload slot). */
export function todoSupportsDescription(hass: HomeAssistant, todoEntity: string): boolean {
  const feats = Number(hass?.states?.[todoEntity]?.attributes?.supported_features ?? 0);
  return (feats & TODO_FEATURE_SET_DESCRIPTION) === TODO_FEATURE_SET_DESCRIPTION;
}

function parseEnvelope(raw: string | undefined | null, namespace: string): unknown | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(trimmed) as Envelope;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed._ns !== namespace) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

/** Pulls a packed envelope out of a summary of the form `Label ⌗{...}`. */
function parseEnvelopeFromSummary(summary: string, namespace: string): unknown | null {
  const sepIndex = summary.lastIndexOf(UC_RECORD_SUMMARY_SEP);
  if (sepIndex !== -1) {
    return parseEnvelope(summary.slice(sepIndex + UC_RECORD_SUMMARY_SEP.length), namespace);
  }
  const braceIndex = summary.indexOf('{');
  if (braceIndex === -1) return null;
  return parseEnvelope(summary.slice(braceIndex), namespace);
}

/** Strips a packed payload from a summary so the label renders cleanly. */
export function stripSummaryPayload(summary: string): string {
  const sepIndex = summary.lastIndexOf(UC_RECORD_SUMMARY_SEP);
  if (sepIndex !== -1) return summary.slice(0, sepIndex).trim();
  const braceIndex = summary.indexOf('{');
  if (braceIndex > 0 && summary.trimEnd().endsWith('}')) {
    return summary.slice(0, braceIndex).trim();
  }
  return summary.trim();
}

class UltraCardRecordStore {
  private _todo = new UltraCardTodoService();

  /** All records in `todoEntity` belonging to `namespace`, newest ordering preserved. */
  async getRecords<T>(
    hass: HomeAssistant,
    todoEntity: string,
    namespace: string,
    onUpdate?: () => void
  ): Promise<UcStoredRecord<T>[]> {
    if (!hass || !todoEntity) return [];
    const items = await this._todo.getItems(hass, todoEntity, onUpdate);
    const out: UcStoredRecord<T>[] = [];
    for (const item of items) {
      const record = this.parseItem<T>(item, namespace);
      if (record) out.push(record);
    }
    return out;
  }

  /** Converts a raw to-do item into a namespaced record, or null when it isn't ours. */
  parseItem<T>(item: TodoItem, namespace: string): UcStoredRecord<T> | null {
    const payload =
      parseEnvelope(item.description, namespace) ??
      parseEnvelopeFromSummary(item.summary || '', namespace);
    if (payload === null) return null;
    const uid = item.uid;
    if (!uid) return null;
    return {
      uid,
      summary: stripSummaryPayload(item.summary || ''),
      status: item.status === 'completed' ? 'completed' : 'needs_action',
      due: item.due,
      payload: payload as T,
    };
  }

  async addRecord<T>(
    hass: HomeAssistant,
    todoEntity: string,
    namespace: string,
    summary: string,
    payload: T,
    options?: { due?: string | undefined }
  ): Promise<void> {
    if (!hass || !todoEntity) return;
    const json = this._encode(namespace, payload);
    const data: Record<string, unknown> = { entity_id: todoEntity };
    if (todoSupportsDescription(hass, todoEntity)) {
      data.item = summary;
      data.description = json;
    } else {
      data.item = `${summary}${UC_RECORD_SUMMARY_SEP}${json}`;
    }
    if (options?.due) data.due_datetime = options.due;
    await hass.callService('todo', 'add_item', data);
    this.invalidate(hass, todoEntity);
  }

  /**
   * Merges `patch.payload` into the stored payload and rewrites the item.
   * Reads the current record first so callers can send partial updates.
   */
  async patchRecord<T extends object>(
    hass: HomeAssistant,
    todoEntity: string,
    namespace: string,
    uid: string,
    patch: {
      summary?: string | undefined;
      payload?: Partial<T> | undefined;
      status?: 'needs_action' | 'completed' | undefined;
      due?: string | null | undefined;
    }
  ): Promise<void> {
    if (!hass || !todoEntity || !uid) return;
    const records = await this.getRecords<T>(hass, todoEntity, namespace);
    const existing = records.find(r => r.uid === uid);
    if (!existing) return;

    const nextPayload = { ...(existing.payload as object), ...(patch.payload ?? {}) } as T;
    const nextSummary = patch.summary ?? existing.summary;
    const json = this._encode(namespace, nextPayload);

    const data: Record<string, unknown> = { entity_id: todoEntity, item: uid };
    if (todoSupportsDescription(hass, todoEntity)) {
      data.rename = nextSummary;
      data.description = json;
    } else {
      data.rename = `${nextSummary}${UC_RECORD_SUMMARY_SEP}${json}`;
    }
    if (patch.status) data.status = patch.status;
    if (patch.due !== undefined) data.due_datetime = patch.due ?? null;

    await hass.callService('todo', 'update_item', data);
    this.invalidate(hass, todoEntity);
  }

  async setStatus(
    hass: HomeAssistant,
    todoEntity: string,
    uid: string,
    status: 'needs_action' | 'completed'
  ): Promise<void> {
    if (!hass || !todoEntity || !uid) return;
    await hass.callService('todo', 'update_item', {
      entity_id: todoEntity,
      item: uid,
      status,
    });
    this.invalidate(hass, todoEntity);
  }

  async removeRecord(hass: HomeAssistant, todoEntity: string, uid: string): Promise<void> {
    if (!hass || !todoEntity || !uid) return;
    await hass.callService('todo', 'remove_item', { entity_id: todoEntity, item: uid });
    this.invalidate(hass, todoEntity);
  }

  /** Drops the cached item list so the next read hits Home Assistant again. */
  invalidate(hass: HomeAssistant | null | undefined, todoEntity: string): void {
    this._todo.invalidateCache(hass, todoEntity);
  }

  private _encode(namespace: string, payload: unknown): string {
    const envelope: Envelope = { _ns: namespace, _v: 1, data: payload };
    return JSON.stringify(envelope);
  }
}

export const ucRecordStore = new UltraCardRecordStore();
