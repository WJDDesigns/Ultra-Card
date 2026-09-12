import { describe, it, expect } from 'vitest';
import {
  normalizeStatus,
  statusColor,
  statusLabel,
  parseTrayColor,
  formatEta,
  parseNumber,
  parseRemainingMinutes,
  isHeating,
  emptySnapshot,
} from '../printer-state';

describe('normalizeStatus', () => {
  it('maps common printing states', () => {
    expect(normalizeStatus('printing')).toBe('printing');
    expect(normalizeStatus('RUNNING')).toBe('printing');
    expect(normalizeStatus('busy')).toBe('printing');
  });

  it('maps paused / finished / error / idle', () => {
    expect(normalizeStatus('paused')).toBe('paused');
    expect(normalizeStatus('finish')).toBe('finished');
    expect(normalizeStatus('failed')).toBe('error');
    expect(normalizeStatus('operational')).toBe('idle');
    expect(normalizeStatus('standby')).toBe('idle');
  });

  it('respects online flag', () => {
    expect(normalizeStatus('printing', false)).toBe('offline');
    expect(normalizeStatus('offline')).toBe('offline');
  });

  it('handles bambu stage-like values', () => {
    expect(normalizeStatus('paused_user')).toBe('paused');
    expect(normalizeStatus('heating_hotend')).toBe('preparing');
  });
});

describe('status helpers', () => {
  it('returns a css color and label for each status', () => {
    const statuses = [
      'printing',
      'paused',
      'idle',
      'finished',
      'error',
      'offline',
      'preparing',
      'unknown',
    ] as const;
    for (const s of statuses) {
      expect(statusColor(s)).toBeTruthy();
      expect(statusLabel(s).length).toBeGreaterThan(0);
    }
  });
});

describe('parseTrayColor', () => {
  it('parses RRGGBBAA to RRGGBB', () => {
    expect(parseTrayColor('#FF0000FF')).toBe('#FF0000');
    expect(parseTrayColor('4488FFAA')).toBe('#4488FF');
  });

  it('returns null for empty / transparent / invalid', () => {
    expect(parseTrayColor(null)).toBeNull();
    expect(parseTrayColor('#00000000')).toBeNull();
    expect(parseTrayColor('not-a-color')).toBeNull();
    expect(parseTrayColor('#FFF')).toBeNull();
  });

  it('accepts 6-digit hex', () => {
    expect(parseTrayColor('#00FF00')).toBe('#00FF00');
  });
});

describe('formatEta', () => {
  it('formats minutes and hours', () => {
    expect(formatEta(null)).toBe('—');
    expect(formatEta(36)).toBe('36m');
    expect(formatEta(60)).toBe('1h');
    expect(formatEta(84)).toBe('1h 24m');
  });
});

describe('parse helpers', () => {
  it('parseNumber handles unavailable', () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber('21.5')).toBe(21.5);
    expect(parseNumber('unavailable')).toBeNull();
    expect(parseNumber(null)).toBeNull();
  });

  it('parseRemainingMinutes handles units and HH:MM:SS', () => {
    expect(parseRemainingMinutes(90)).toBe(90);
    expect(parseRemainingMinutes(1.5, 'h')).toBe(90);
    expect(parseRemainingMinutes('1:24:00')).toBe(84);
    expect(parseRemainingMinutes('0:36')).toBe(36);
  });

  it('isHeating detects under-target heat', () => {
    expect(isHeating(180, 220)).toBe(true);
    expect(isHeating(220, 220)).toBe(false);
    expect(isHeating(25, 0)).toBe(false);
  });
});

describe('emptySnapshot', () => {
  it('returns a safe offline shell', () => {
    const s = emptySnapshot('p1', 'X1C');
    expect(s.id).toBe('p1');
    expect(s.name).toBe('X1C');
    expect(s.status).toBe('offline');
    expect(s.trays).toEqual([]);
    expect(s.entityIds).toEqual([]);
  });
});
