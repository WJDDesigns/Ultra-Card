/**
 * Builds the text a QR code encodes for the QR module's content types
 * (Wi-Fi, map location / route, WhatsApp, phone, SMS, email, contact card,
 * Spotify, social profile). Pure functions so they can be unit tested; the
 * module passes in a minimal `states` map for entity-backed fields.
 */

export type QrContentType =
  | 'text'
  | 'wifi'
  | 'location'
  | 'route'
  | 'whatsapp'
  | 'phone'
  | 'sms'
  | 'email'
  | 'contact'
  | 'spotify'
  | 'social';

export type QrMapsProvider = 'google' | 'apple' | 'osm';
export type QrTravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';
export type QrSocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'threads'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'github';

export interface QrContentData {
  // Wi-Fi
  wifi_ssid?: string | undefined;
  wifi_password?: string | undefined;
  wifi_security?: 'WPA' | 'WEP' | 'nopass' | undefined;
  wifi_hidden?: boolean | undefined;
  // Location (a pin / map centre)
  location_entity?: string | undefined;
  location_query?: string | undefined;
  maps_provider?: QrMapsProvider | undefined;
  map_zoom?: number | undefined;
  // Route
  route_origin_entity?: string | undefined;
  route_origin?: string | undefined;
  route_destination_entity?: string | undefined;
  route_destination?: string | undefined;
  travel_mode?: QrTravelMode | undefined;
  start_navigation?: boolean | undefined;
  // WhatsApp / phone / SMS / email
  phone?: string | undefined;
  message?: string | undefined;
  email?: string | undefined;
  email_subject?: string | undefined;
  // Contact card (vCard)
  contact_entity?: string | undefined;
  contact_name?: string | undefined;
  contact_phone?: string | undefined;
  contact_email?: string | undefined;
  contact_org?: string | undefined;
  contact_url?: string | undefined;
  contact_address?: string | undefined;
  // Spotify
  spotify_entity?: string | undefined;
  spotify_url?: string | undefined;
  // Social
  social_platform?: QrSocialPlatform | undefined;
  social_username?: string | undefined;
}

/** The slice of Home Assistant state the builder reads. */
export type QrStateMap = Record<
  string,
  { state: string; attributes: Record<string, unknown> } | undefined
>;

const trim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Escape a value for the Wi-Fi QR format (\ ; , : " are special). */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/** Escape a value for vCard 3.0 text fields. */
export function escapeVCardValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([;,])/g, '\\$1');
}

/** Digits (and a leading +) only, as wa.me and tel: links want. */
export function normalizePhone(value: string, keepPlus = true): string {
  const t = value.trim();
  const plus = keepPlus && t.startsWith('+') ? '+' : '';
  return plus + t.replace(/[^\d]/g, '');
}

/**
 * A place for a map link: the entity's coordinates when it has them (person,
 * device_tracker, zone), else its state when that looks like an address, else
 * the typed text.
 */
export function resolvePlace(
  entityId: string | undefined,
  typed: string | undefined,
  states: QrStateMap | undefined
): string {
  const id = trim(entityId);
  const st = id ? states?.[id] : undefined;
  if (st) {
    const lat = Number(st.attributes?.latitude);
    const lon = Number(st.attributes?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return `${lat},${lon}`;
    const s = trim(st.state);
    if (s && !['unknown', 'unavailable', 'home', 'not_home'].includes(s)) return s;
  }
  return trim(typed);
}

const isLatLon = (v: string): boolean => /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(v);

export function buildWifi(d: QrContentData): string {
  const ssid = trim(d.wifi_ssid);
  if (!ssid) return '';
  const security = d.wifi_security || 'WPA';
  let out = `WIFI:T:${security};S:${escapeWifiValue(ssid)};`;
  if (security !== 'nopass') out += `P:${escapeWifiValue(d.wifi_password || '')};`;
  if (d.wifi_hidden) out += 'H:true;';
  return `${out};`;
}

export function buildLocation(d: QrContentData, states?: QrStateMap): string {
  const place = resolvePlace(d.location_entity, d.location_query, states);
  if (!place) return '';
  const q = encodeURIComponent(place);
  const zoom = d.map_zoom && d.map_zoom > 0 ? Math.round(Math.min(21, d.map_zoom)) : undefined;
  switch (d.maps_provider || 'google') {
    case 'apple':
      return `https://maps.apple.com/?${isLatLon(place) ? `ll=${q}&q=${q}` : `q=${q}`}${
        zoom ? `&z=${zoom}` : ''
      }`;
    case 'osm': {
      if (isLatLon(place)) {
        const [lat, lon] = place.split(',').map(s => s.trim());
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom || 16}/${lat}/${lon}`;
      }
      return `https://www.openstreetmap.org/search?query=${q}`;
    }
    default:
      if (zoom && isLatLon(place)) {
        return `https://www.google.com/maps/@?api=1&map_action=map&center=${q}&zoom=${zoom}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
}

export function buildRoute(d: QrContentData, states?: QrStateMap): string {
  const dest = resolvePlace(d.route_destination_entity, d.route_destination, states);
  if (!dest) return '';
  const origin = resolvePlace(d.route_origin_entity, d.route_origin, states);
  const mode = d.travel_mode || 'driving';
  switch (d.maps_provider || 'google') {
    case 'apple': {
      const flag = mode === 'walking' ? 'w' : mode === 'transit' ? 'r' : 'd';
      return `https://maps.apple.com/?daddr=${encodeURIComponent(dest)}${
        origin ? `&saddr=${encodeURIComponent(origin)}` : ''
      }&dirflg=${flag}`;
    }
    case 'osm': {
      const engine =
        mode === 'walking'
          ? 'fossgis_osrm_foot'
          : mode === 'bicycling'
            ? 'fossgis_osrm_bike'
            : 'fossgis_osrm_car';
      return `https://www.openstreetmap.org/directions?engine=${engine}&route=${encodeURIComponent(
        `${origin};${dest}`
      )}`;
    }
    default: {
      let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
      if (origin) url += `&origin=${encodeURIComponent(origin)}`;
      url += `&travelmode=${mode}`;
      if (d.start_navigation) url += '&dir_action=navigate';
      return url;
    }
  }
}

export function buildWhatsApp(d: QrContentData): string {
  const phone = normalizePhone(d.phone || '', false);
  const msg = trim(d.message);
  if (!phone && !msg) return '';
  return `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
}

export function buildPhone(d: QrContentData): string {
  const phone = normalizePhone(d.phone || '');
  return phone ? `tel:${phone}` : '';
}

export function buildSms(d: QrContentData): string {
  const phone = normalizePhone(d.phone || '');
  if (!phone) return '';
  const msg = trim(d.message);
  return msg ? `SMSTO:${phone}:${msg}` : `SMSTO:${phone}`;
}

export function buildEmail(d: QrContentData): string {
  const to = trim(d.email);
  if (!to) return '';
  const params: string[] = [];
  if (trim(d.email_subject)) params.push(`subject=${encodeURIComponent(trim(d.email_subject))}`);
  if (trim(d.message)) params.push(`body=${encodeURIComponent(trim(d.message))}`);
  return `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`;
}

export function buildContact(d: QrContentData, states?: QrStateMap): string {
  const ent = trim(d.contact_entity) ? states?.[trim(d.contact_entity)] : undefined;
  const name = trim(d.contact_name) || trim(ent?.attributes?.friendly_name);
  const phone = trim(d.contact_phone);
  const email = trim(d.contact_email);
  if (!name && !phone && !email) return '';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (name) {
    const parts = name.split(/\s+/);
    const last = parts.length > 1 ? parts[parts.length - 1] : '';
    const first = parts.length > 1 ? parts.slice(0, -1).join(' ') : name;
    lines.push(`N:${escapeVCardValue(last || '')};${escapeVCardValue(first || '')};;;`);
    lines.push(`FN:${escapeVCardValue(name)}`);
  }
  if (trim(d.contact_org)) lines.push(`ORG:${escapeVCardValue(trim(d.contact_org))}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (trim(d.contact_address)) lines.push(`ADR:;;${escapeVCardValue(trim(d.contact_address))};;;;`);
  if (trim(d.contact_url)) lines.push(`URL:${trim(d.contact_url)}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Spotify link for what a media player is playing (Spotify integration gives a
 * `spotify:track:ID` content id), or the typed URL / URI.
 */
export function spotifyUriToUrl(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  const m = v.match(/^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)/);
  if (m) return `https://open.spotify.com/${m[1]}/${m[2]}`;
  return '';
}

export function buildSpotify(d: QrContentData, states?: QrStateMap): string {
  const id = trim(d.spotify_entity);
  const st = id ? states?.[id] : undefined;
  if (st) {
    const fromContent = spotifyUriToUrl(String(st.attributes?.media_content_id ?? ''));
    if (fromContent) return fromContent;
  }
  return spotifyUriToUrl(d.spotify_url || '');
}

const SOCIAL_BASE: Record<QrSocialPlatform, string> = {
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  x: 'https://x.com/',
  threads: 'https://www.threads.net/@',
  tiktok: 'https://www.tiktok.com/@',
  youtube: 'https://www.youtube.com/@',
  linkedin: 'https://www.linkedin.com/in/',
  github: 'https://github.com/',
};

export function buildSocial(d: QrContentData): string {
  const raw = trim(d.social_username);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const user = raw.replace(/^@/, '');
  return `${SOCIAL_BASE[d.social_platform || 'instagram']}${encodeURIComponent(user)}`;
}

/** Text to encode for a structured content type ('' when not enough is filled in). */
export function buildQrContent(
  type: QrContentType | undefined,
  data: QrContentData | undefined,
  states?: QrStateMap
): string {
  const d = data || {};
  switch (type) {
    case 'wifi':
      return buildWifi(d);
    case 'location':
      return buildLocation(d, states);
    case 'route':
      return buildRoute(d, states);
    case 'whatsapp':
      return buildWhatsApp(d);
    case 'phone':
      return buildPhone(d);
    case 'sms':
      return buildSms(d);
    case 'email':
      return buildEmail(d);
    case 'contact':
      return buildContact(d, states);
    case 'spotify':
      return buildSpotify(d, states);
    case 'social':
      return buildSocial(d);
    default:
      return '';
  }
}
