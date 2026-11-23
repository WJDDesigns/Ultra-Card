// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

import { fetchFromHomeAssistant, isSameOriginPath, toHomeAssistantPath } from './ha-fetch';

const origin = window.location.origin;
const hass = { hassUrl: () => origin } as any;

describe('isSameOriginPath', () => {
  it('accepts plain relative paths', () => {
    expect(isSameOriginPath('/local/logo.png')).toBe(true);
    expect(isSameOriginPath('/api/image/upload')).toBe(true);
  });
  it('refuses anything that can reach another host', () => {
    expect(isSameOriginPath('//evil.example/x')).toBe(false);
    expect(isSameOriginPath('/\\evil.example/x')).toBe(false);
    expect(isSameOriginPath('https://evil.example/x')).toBe(false);
    expect(isSameOriginPath('local/logo.png')).toBe(false);
  });
});

describe('toHomeAssistantPath', () => {
  it('keeps URLs on this Home Assistant as relative paths', () => {
    expect(toHomeAssistantPath('/local/logo.png?v=2', hass)).toBe('/local/logo.png?v=2');
    expect(toHomeAssistantPath(`${origin}/local/logo.png`, hass)).toBe('/local/logo.png');
  });
  it('returns null for other hosts, including tricky spellings', () => {
    expect(toHomeAssistantPath('https://evil.example/logo.png', hass)).toBeNull();
    expect(toHomeAssistantPath('HTTPS://evil.example/logo.png', hass)).toBeNull();
    expect(toHomeAssistantPath('//evil.example/logo.png', hass)).toBeNull();
    expect(toHomeAssistantPath('/\\evil.example/logo.png', hass)).toBeNull();
    expect(toHomeAssistantPath(`${origin}.evil.example/logo.png`, hass)).toBeNull();
    expect(toHomeAssistantPath('data:image/png;base64,AAAA', hass)).toBeNull();
  });
});

describe('fetchFromHomeAssistant', () => {
  it('sends relative paths through hass.fetchWithAuth', async () => {
    const fetchWithAuth = vi.fn().mockResolvedValue(new Response('ok'));
    await fetchFromHomeAssistant({ fetchWithAuth } as any, '/api/image/upload', { method: 'POST' });
    expect(fetchWithAuth).toHaveBeenCalledWith('/api/image/upload', { method: 'POST' });
  });
  it('refuses other hosts without calling fetchWithAuth', async () => {
    const fetchWithAuth = vi.fn();
    await expect(
      fetchFromHomeAssistant({ fetchWithAuth } as any, '//evil.example/x')
    ).rejects.toThrow();
    expect(fetchWithAuth).not.toHaveBeenCalled();
  });
});
