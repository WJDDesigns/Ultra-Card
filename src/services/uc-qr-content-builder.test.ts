import { describe, it, expect } from 'vitest';
import {
  buildQrContent,
  escapeWifiValue,
  spotifyUriToUrl,
  resolvePlace,
  type QrStateMap,
} from './uc-qr-content-builder';

const states: QrStateMap = {
  'person.anna': {
    state: 'home',
    attributes: { friendly_name: 'Anna Schmidt', latitude: 52.52, longitude: 13.405 },
  },
  'media_player.spotify': {
    state: 'playing',
    attributes: { media_content_id: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC' },
  },
};

describe('uc-qr-content-builder', () => {
  it('builds a Wi-Fi string with escaping', () => {
    expect(escapeWifiValue('a;b,c')).toBe(String.raw`a\;b\,c`);
    expect(
      buildQrContent('wifi', { wifi_ssid: 'Home;Net', wifi_password: 'p:w', wifi_security: 'WPA' })
    ).toBe(String.raw`WIFI:T:WPA;S:Home\;Net;P:p\:w;;`);
    expect(buildQrContent('wifi', { wifi_ssid: 'Guest', wifi_security: 'nopass', wifi_hidden: true })).toBe(
      'WIFI:T:nopass;S:Guest;H:true;;'
    );
    expect(buildQrContent('wifi', {})).toBe('');
  });

  it('resolves places from entity coordinates or typed text', () => {
    expect(resolvePlace('person.anna', 'ignored', states)).toBe('52.52,13.405');
    expect(resolvePlace('', 'Berlin', states)).toBe('Berlin');
    expect(resolvePlace('person.missing', 'Paris', states)).toBe('Paris');
  });

  it('builds map links for a location', () => {
    expect(buildQrContent('location', { location_query: 'Alexanderplatz Berlin' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Alexanderplatz%20Berlin'
    );
    expect(
      buildQrContent('location', { location_entity: 'person.anna', map_zoom: 15 }, states)
    ).toBe('https://www.google.com/maps/@?api=1&map_action=map&center=52.52%2C13.405&zoom=15');
    expect(
      buildQrContent('location', { location_query: '52.5,13.4', maps_provider: 'osm' })
    ).toBe('https://www.openstreetmap.org/?mlat=52.5&mlon=13.4#map=16/52.5/13.4');
  });

  it('builds routes', () => {
    expect(
      buildQrContent('route', {
        route_origin: 'Berlin',
        route_destination: 'Hamburg',
        travel_mode: 'transit',
        start_navigation: true,
      })
    ).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Hamburg&origin=Berlin&travelmode=transit&dir_action=navigate'
    );
    expect(
      buildQrContent('route', { route_destination: 'Hamburg', maps_provider: 'apple', travel_mode: 'walking' })
    ).toBe('https://maps.apple.com/?daddr=Hamburg&dirflg=w');
    expect(buildQrContent('route', { route_origin: 'Berlin' })).toBe('');
  });

  it('builds messaging links', () => {
    expect(buildQrContent('whatsapp', { phone: '+49 151 234-567', message: 'Hi there' })).toBe(
      'https://wa.me/49151234567?text=Hi%20there'
    );
    expect(buildQrContent('phone', { phone: '+49 151 234' })).toBe('tel:+49151234');
    expect(buildQrContent('sms', { phone: '0151', message: 'Hello' })).toBe('SMSTO:0151:Hello');
    expect(buildQrContent('email', { email: 'a@b.de', email_subject: 'Hi', message: 'x y' })).toBe(
      'mailto:a@b.de?subject=Hi&body=x%20y'
    );
  });

  it('builds a vCard, taking the name from a person entity', () => {
    const v = buildQrContent('contact', { contact_entity: 'person.anna', contact_phone: '+49151' }, states);
    expect(v).toContain('BEGIN:VCARD');
    expect(v).toContain('FN:Anna Schmidt');
    expect(v).toContain('N:Schmidt;Anna;;;');
    expect(v).toContain('TEL;TYPE=CELL:+49151');
    expect(v.endsWith('END:VCARD')).toBe(true);
    expect(buildQrContent('contact', {})).toBe('');
  });

  it('builds Spotify links from a media player or a URI', () => {
    expect(spotifyUriToUrl('spotify:album:abc123')).toBe('https://open.spotify.com/album/abc123');
    expect(buildQrContent('spotify', { spotify_entity: 'media_player.spotify' }, states)).toBe(
      'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'
    );
    expect(buildQrContent('spotify', { spotify_url: 'not a link' })).toBe('');
  });

  it('builds social profile links', () => {
    expect(buildQrContent('social', { social_platform: 'tiktok', social_username: '@ultracard' })).toBe(
      'https://www.tiktok.com/@ultracard'
    );
    expect(buildQrContent('social', { social_username: 'https://example.com/me' })).toBe(
      'https://example.com/me'
    );
  });

  it('returns empty for plain text', () => {
    expect(buildQrContent('text', { phone: '1' })).toBe('');
  });
});
