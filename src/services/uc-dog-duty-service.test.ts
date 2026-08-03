import { describe, it, expect } from 'vitest';
import { UltraCardDogDutyService } from './uc-dog-duty-service';

describe('UltraCardDogDutyService', () => {
  const service = new UltraCardDogDutyService();

  it('parses a valid dog-duty todo description into an event', () => {
    const event = service.parseEvent({
      uid: 'abc',
      summary: 'Dog duty @ 40%, 60%',
      status: 'needs_action',
      description: JSON.stringify({
        x: 0.4,
        y: 0.6,
        confidence: 0.9,
        detected_at: '2026-08-01T12:00:00.000Z',
        camera: 'camera.yard',
        source: 'scan_now',
      }),
    });

    expect(event).not.toBeNull();
    expect(event!.uid).toBe('abc');
    expect(event!.cleaned).toBe(false);
    expect(event!.payload.x).toBe(0.4);
    expect(event!.payload.y).toBe(0.6);
    expect(event!.payload.confidence).toBe(0.9);
    expect(event!.detectedAt).toBe(Date.parse('2026-08-01T12:00:00.000Z'));
  });

  it('marks completed todo items as cleaned', () => {
    const event = service.parseEvent({
      uid: 'done',
      summary: 'Dog duty',
      status: 'completed',
      description: JSON.stringify({ x: 0.1, y: 0.2, detected_at: '2026-08-01T12:00:00.000Z' }),
    });
    expect(event!.cleaned).toBe(true);
  });

  it('returns null for non-dog-duty todo descriptions', () => {
    expect(
      service.parseEvent({
        uid: '1',
        summary: 'Buy milk',
        status: 'needs_action',
        description: 'From the store',
      })
    ).toBeNull();

    expect(
      service.parseEvent({
        uid: '2',
        summary: 'Broken json',
        status: 'needs_action',
        description: '{not json',
      })
    ).toBeNull();
  });

  it('clamps out-of-range coordinates', () => {
    const event = service.parseEvent({
      uid: '3',
      summary: 'Dog duty',
      status: 'needs_action',
      description: JSON.stringify({ x: 1.5, y: -0.2 }),
    });
    expect(event!.payload.x).toBe(1);
    expect(event!.payload.y).toBe(0);
  });

  it('builds an automation config with camera, todo, and provider', () => {
    const config = service.buildAutomationConfig({
      cameraEntity: 'camera.yard',
      todoEntity: 'todo.dog_duty',
      providerId: 'provider_123',
      triggerEntity: 'binary_sensor.dog_detected',
      cooldownMinutes: 15,
      automationId: 'ultra_card_dog_duty_test',
    });

    expect(config.id).toBe('ultra_card_dog_duty_test');
    expect(config.alias).toBe('Ultra Card — Dog Duty');
    expect(Array.isArray(config.triggers)).toBe(true);
    expect(Array.isArray(config.actions)).toBe(true);
    const triggers = config.triggers as any[];
    expect(triggers[0].entity_id).toBe('binary_sensor.dog_detected');
  });

  it('embeds example images and composed message in automation config', () => {
    const config = service.buildAutomationConfig({
      cameraEntity: 'camera.yard',
      todoEntity: 'todo.dog_duty',
      providerId: 'provider_123',
      automationId: 'ultra_card_dog_duty_ex',
      sensitivity: 'strict',
      extraTips: 'White dog, dark piles',
      exampleImages: ['media-source://media_source/local/dog-duty/ex1.jpg'],
      roi: { x: 0.1, y: 0.2, width: 0.5, height: 0.4 },
    });
    const actions = config.actions as any[];
    const analyze = actions.find((a: any) => a.alias === 'Analyze with LLM Vision');
    expect(analyze.data.image_file).toContain('/media/local/dog-duty/ex1.jpg');
    expect(analyze.data.message).toMatch(/REFERENCE EXAMPLES/i);
    expect(analyze.data.message).toMatch(/White dog/);
    expect(analyze.data.message).toMatch(/left=0\.100/);
    expect(analyze.data.message).toMatch(/Be strict/);
  });

  it('falls back to a scheduled trigger with interval + active hours when no sensor', () => {
    const config = service.buildAutomationConfig({
      cameraEntity: 'camera.yard',
      todoEntity: 'todo.dog_duty',
      providerId: 'provider_123',
      automationId: 'ultra_card_dog_duty_sched',
      intervalMinutes: 15,
      activeStart: '7:00',
      activeEnd: '21:30',
    });

    const triggers = config.triggers as any[];
    expect(triggers[0].platform).toBe('time_pattern');
    expect(triggers[0].minutes).toBe('/15');

    const conditions = config.conditions as any[];
    const timeCond = conditions.find((c: any) => c.condition === 'time');
    expect(timeCond).toBeDefined();
    expect(timeCond.after).toBe('07:00');
    expect(timeCond.before).toBe('21:30');
  });

  it('uses an hourly time pattern for intervals of 60 minutes or more', () => {
    const config = service.buildAutomationConfig({
      cameraEntity: 'camera.yard',
      todoEntity: 'todo.dog_duty',
      providerId: 'provider_123',
      automationId: 'ultra_card_dog_duty_hourly',
      intervalMinutes: 120,
    });

    const triggers = config.triggers as any[];
    expect(triggers[0].platform).toBe('time_pattern');
    expect(triggers[0].hours).toBe('/2');
    expect(triggers[0].minutes).toBe('0');
  });

  it('skips the time condition when a trigger sensor is set', () => {
    const config = service.buildAutomationConfig({
      cameraEntity: 'camera.yard',
      todoEntity: 'todo.dog_duty',
      providerId: 'provider_123',
      triggerEntity: 'binary_sensor.dog_detected',
      automationId: 'ultra_card_dog_duty_sensor',
      activeStart: '07:00',
      activeEnd: '21:00',
    });
    const conditions = config.conditions as any[];
    expect(conditions.some((c: any) => c.condition === 'time')).toBe(false);
  });

  it('parses marker JSON embedded in the summary (shopping-list mode)', () => {
    const event = service.parseEvent({
      uid: 's1',
      summary:
        'Dog duty @ 40%, 60% ⌗{"x":0.4,"y":0.6,"confidence":0.9,"detected_at":"2026-08-01T12:00:00.000Z"}',
      status: 'needs_action',
    });
    expect(event).not.toBeNull();
    expect(event!.payload.x).toBe(0.4);
    expect(event!.summary).toBe('Dog duty @ 40%, 60%');
  });
});

describe('normalizeClockTime', () => {
  it('normalizes and validates HH:MM values', async () => {
    const { normalizeClockTime } = await import('./uc-dog-duty-service');
    expect(normalizeClockTime('7:5')).toBeNull();
    expect(normalizeClockTime('7:05')).toBe('07:05');
    expect(normalizeClockTime('21:30:00')).toBe('21:30');
    expect(normalizeClockTime('25:00')).toBeNull();
    expect(normalizeClockTime('bad')).toBeNull();
    expect(normalizeClockTime(undefined)).toBeNull();
  });
});

describe('buildDetectionPrompt', () => {
  it('composes single-mode prompt with tips and ROI without exposing a user prompt label', async () => {
    const { buildDetectionPrompt } = await import('./uc-dog-duty-service');
    const msg = buildDetectionPrompt({
      mode: 'single',
      sensitivity: 'lenient',
      detectSquatting: false,
      extraTips: 'Piles near fence',
      roi: { x: 0.2, y: 0.3, width: 0.4, height: 0.5 },
      hasExamples: true,
    });
    expect(msg).toMatch(/REFERENCE EXAMPLES/i);
    expect(msg).toMatch(/sitting or standing/i);
    expect(msg).toMatch(/Yard-specific notes/);
    expect(msg).toMatch(/Piles near fence/);
    expect(msg).toMatch(/Be attentive/);
    expect(msg.toLowerCase()).not.toContain('user prompt');
  });
});

describe('resolveLlmVisionImagePath', () => {
  it('maps media-source and /local paths to filesystem paths', async () => {
    const { resolveLlmVisionImagePath, resolveExampleImagePaths } = await import(
      './uc-dog-duty-service'
    );
    expect(resolveLlmVisionImagePath('media-source://media_source/local/a.jpg')).toBe(
      '/media/local/a.jpg'
    );
    expect(resolveLlmVisionImagePath('/local/foo.png')).toBe('/config/www/foo.png');
    expect(resolveLlmVisionImagePath('https://example.com/x.jpg')).toBeNull();
    expect(resolveExampleImagePaths(['/media/local/a.jpg', '/media/local/a.jpg', 'https://x'])).toEqual([
      '/media/local/a.jpg',
    ]);
  });
});

describe('filterDetectionSpots', () => {
  it('drops low-confidence and out-of-ROI spots', async () => {
    const { filterDetectionSpots } = await import('./uc-dog-duty-service');
    const filtered = filterDetectionSpots(
      {
        found: true,
        spots: [
          { x: 0.5, y: 0.5, confidence: 0.9 },
          { x: 0.5, y: 0.5, confidence: 0.2 },
          { x: 0.05, y: 0.05, confidence: 0.9 },
        ],
      },
      {
        minConfidence: 0.45,
        roi: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
      }
    );
    expect(filtered.spots).toHaveLength(1);
    expect(filtered.spots[0].confidence).toBe(0.9);
    expect(filtered.found).toBe(true);
  });
});

describe('parseAnalyzerPayload', () => {
  it('parses structured object responses', async () => {
    const { parseAnalyzerPayload } = await import('./uc-dog-duty-service');
    const result = parseAnalyzerPayload({
      found: true,
      spots: [{ x: 0.2, y: 0.8, confidence: 0.9 }],
    });
    expect(result.found).toBe(true);
    expect(result.spots[0].x).toBe(0.2);
    expect(result.error).toBeUndefined();
  });

  it('parses response_text JSON from llmvision', async () => {
    const { parseAnalyzerPayload } = await import('./uc-dog-duty-service');
    const result = parseAnalyzerPayload({
      response_text: 'Here you go:\n```json\n{"found":false,"spots":[]}\n```',
    });
    expect(result.found).toBe(false);
    expect(result.spots).toEqual([]);
  });

  it('treats natural-language negatives as no spots', async () => {
    const { parseAnalyzerPayload } = await import('./uc-dog-duty-service');
    const result = parseAnalyzerPayload({
      response_text: 'No dog droppings were found in the yard.',
    });
    expect(result.found).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('includes a snippet when prose has no JSON', async () => {
    const { parseAnalyzerPayload } = await import('./uc-dog-duty-service');
    const result = parseAnalyzerPayload({
      response_text: 'The camera shows grass and a fence under cloudy skies.',
    });
    expect(result.error).toMatch(/No JSON object/);
  });
});

describe('mapLlmVisionProviders', () => {
  it('excludes the LLM Vision Settings shell entry', async () => {
    const { mapLlmVisionProviders, isLlmVisionSettingsEntry } = await import(
      './uc-dog-duty-service'
    );

    expect(isLlmVisionSettingsEntry('LLM Vision Settings')).toBe(true);
    expect(isLlmVisionSettingsEntry('Anthropic Claude')).toBe(false);

    const providers = mapLlmVisionProviders([
      { domain: 'llmvision', entry_id: 'settings-id', title: 'LLM Vision Settings' },
      { domain: 'llmvision', entry_id: 'anthropic-id', title: 'Anthropic Claude' },
      { domain: 'llmvision', entry_id: 'openai-id', title: 'OpenAI' },
      { domain: 'other', entry_id: 'x', title: 'Nope' },
    ]);

    expect(providers.map(p => p.title)).toEqual(['Anthropic Claude', 'OpenAI']);
    expect(providers.every(p => p.id !== 'settings-id')).toBe(true);
  });
});
