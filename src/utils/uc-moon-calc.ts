/**
 * Ultra Card Moon Calculation Engine
 *
 * Self-contained lunar astronomy math used by the Lunar Phase module.
 * Formulas are derived from the public-domain astronomy described in
 * "Astronomical Algorithms" (Meeus) / Astronomy Answers, in the same way
 * the well-known SunCalc library implements them. No external dependencies.
 *
 * Accuracy is within a couple of minutes for rise/set times and well under
 * a degree for position — more than enough for a dashboard card.
 */

const RAD = Math.PI / 180;
const DAY_MS = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = RAD * 23.4397;
/** Mean length of the synodic month in days */
export const LUNAR_CYCLE_DAYS = 29.530588853;

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toJulian(date: Date): number {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}
function fromJulian(j: number): Date {
  return new Date((j + 0.5 - J1970) * DAY_MS);
}
function toDays(date: Date): number {
  return toJulian(date) - J2000;
}
function hoursLater(date: Date, h: number): Date {
  return new Date(date.valueOf() + (h * DAY_MS) / 24);
}

// ─── General celestial math ───────────────────────────────────────────────────

function rightAscension(l: number, b: number): number {
  return Math.atan2(
    Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY),
    Math.cos(l)
  );
}
function declination(l: number, b: number): number {
  return Math.asin(
    Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l)
  );
}
function azimuthOf(H: number, phi: number, dec: number): number {
  return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
}
function altitudeOf(H: number, phi: number, dec: number): number {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)
  );
}
function siderealTime(d: number, lw: number): number {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}
function astroRefraction(h: number): number {
  if (h < 0) h = 0;
  return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// ─── Sun coordinates (needed for illumination) ────────────────────────────────

function solarMeanAnomaly(d: number): number {
  return RAD * (357.5291 + 0.98560028 * d);
}
function eclipticLongitude(M: number): number {
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = RAD * 102.9372;
  return M + C + P + Math.PI;
}
function sunCoords(d: number): { dec: number; ra: number } {
  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  return { dec: declination(L, 0), ra: rightAscension(L, 0) };
}

// ─── Moon coordinates ─────────────────────────────────────────────────────────

function moonCoords(d: number): { ra: number; dec: number; dist: number } {
  const L = RAD * (218.316 + 13.176396 * d); // ecliptic longitude
  const M = RAD * (134.963 + 13.064993 * d); // mean anomaly
  const F = RAD * (93.272 + 13.22935 * d); // mean distance

  const l = L + RAD * 6.289 * Math.sin(M); // longitude
  const b = RAD * 5.128 * Math.sin(F); // latitude
  const dt = 385001 - 20905 * Math.cos(M); // distance to the moon in km

  return { ra: rightAscension(l, b), dec: declination(l, b), dist: dt };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MoonPosition {
  /** Azimuth in degrees, measured from North, clockwise (0..360) */
  azimuthDegrees: number;
  /** Altitude above the horizon in degrees */
  altitudeDegrees: number;
  /** Distance to the moon in km */
  distanceKm: number;
  /** Parallactic angle in radians */
  parallacticAngle: number;
}

export function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition {
  const lw = RAD * -lng;
  const phi = RAD * lat;
  const d = toDays(date);
  const c = moonCoords(d);
  const H = siderealTime(d, lw) - c.ra;
  let h = altitudeOf(H, phi, c.dec);
  const pa = Math.atan2(
    Math.sin(H),
    Math.tan(phi) * Math.cos(c.dec) - Math.sin(c.dec) * Math.cos(H)
  );
  h += astroRefraction(h);

  // Normalize azimuth: formula above is measured from South; convert to from-North 0..360
  const azFromNorth = (azimuthOf(H, phi, c.dec) / RAD + 180) % 360;

  return {
    azimuthDegrees: azFromNorth < 0 ? azFromNorth + 360 : azFromNorth,
    altitudeDegrees: h / RAD,
    distanceKm: c.dist,
    parallacticAngle: pa,
  };
}

export interface MoonIllumination {
  /** Illuminated fraction 0..1 */
  fraction: number;
  /** Phase position in the lunation 0..1 (0 = new, 0.5 = full) */
  phase: number;
  /** Midpoint angle of the illuminated limb in radians */
  angle: number;
}

export function getMoonIllumination(date: Date): MoonIllumination {
  const d = toDays(date);
  const s = sunCoords(d);
  const m = moonCoords(d);

  const sdist = 149598000; // distance from Earth to Sun in km

  const phi = Math.acos(
    Math.sin(s.dec) * Math.sin(m.dec) +
      Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra)
  );
  const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi));
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) -
      Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra)
  );

  return {
    fraction: (1 + Math.cos(inc)) / 2,
    phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI,
    angle,
  };
}

export interface MoonTimes {
  rise: Date | null;
  set: Date | null;
  /** True when the moon is above the horizon the entire day */
  alwaysUp: boolean;
  /** True when the moon stays below the horizon the entire day */
  alwaysDown: boolean;
}

/**
 * Moon rise/set times for the calendar day containing `date` (local midnight based).
 */
export function getMoonTimes(date: Date, lat: number, lng: number): MoonTimes {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);

  const hc = 0.133 * RAD;
  let h0 = getMoonPositionRad(t, lat, lng).altitude - hc;
  let rise = 0;
  let setT = 0;
  let ye = 0;

  // Scan in 2-hour chunks, fitting a parabola through three points to find crossings
  for (let i = 1; i <= 24; i += 2) {
    const h1 = getMoonPositionRad(hoursLater(t, i), lat, lng).altitude - hc;
    const h2 = getMoonPositionRad(hoursLater(t, i + 1), lat, lng).altitude - hc;

    const a = (h0 + h2) / 2 - h1;
    const b = (h2 - h0) / 2;
    const xe = -b / (2 * a);
    ye = (a * xe + b) * xe + h1;
    const dCrit = b * b - 4 * a * h1;
    let roots = 0;
    let x1 = 0;
    let x2 = 0;

    if (dCrit >= 0) {
      const dx = Math.sqrt(dCrit) / (Math.abs(a) * 2);
      x1 = xe - dx;
      x2 = xe + dx;
      if (Math.abs(x1) <= 1) roots++;
      if (Math.abs(x2) <= 1) roots++;
      if (x1 < -1) x1 = x2;
    }

    if (roots === 1) {
      if (h0 < 0) rise = i + x1;
      else setT = i + x1;
    } else if (roots === 2) {
      rise = i + (ye < 0 ? x2 : x1);
      setT = i + (ye < 0 ? x1 : x2);
    }

    if (rise && setT) break;
    h0 = h2;
  }

  return {
    rise: rise ? hoursLater(t, rise) : null,
    set: setT ? hoursLater(t, setT) : null,
    alwaysUp: !rise && !setT && ye > 0,
    alwaysDown: !rise && !setT && ye <= 0,
  };
}

/** Internal: altitude/azimuth in radians (no refraction) for the rise/set scan */
function getMoonPositionRad(
  date: Date,
  lat: number,
  lng: number
): { altitude: number; azimuth: number } {
  const lw = RAD * -lng;
  const phi = RAD * lat;
  const d = toDays(date);
  const c = moonCoords(d);
  const H = siderealTime(d, lw) - c.ra;
  return { altitude: altitudeOf(H, phi, c.dec), azimuth: azimuthOf(H, phi, c.dec) };
}

/**
 * Time of the moon's highest point (transit) for the day containing `date`,
 * found by sampling altitude in 10-minute steps.
 */
export function getMoonTransit(
  date: Date,
  lat: number,
  lng: number
): { time: Date; altitudeDegrees: number } | null {
  const t = new Date(date);
  t.setHours(0, 0, 0, 0);
  let best: { time: Date; alt: number } | null = null;
  for (let m = 0; m <= 24 * 60; m += 10) {
    const when = new Date(t.valueOf() + m * 60000);
    const alt = getMoonPositionRad(when, lat, lng).altitude;
    if (!best || alt > best.alt) best = { time: when, alt };
  }
  if (!best || best.alt <= 0) return best ? { time: best.time, altitudeDegrees: best.alt / RAD } : null;
  return { time: best.time, altitudeDegrees: best.alt / RAD };
}

// ─── Phase events (next new / full / quarter moons) ───────────────────────────

export type MoonPhaseId =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

const PHASE_IDS: MoonPhaseId[] = [
  'new_moon',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
  'full_moon',
  'waning_gibbous',
  'last_quarter',
  'waning_crescent',
];

/** Map a phase value (0..1) to one of the 8 named phases */
export function getPhaseId(phase: number): MoonPhaseId {
  const idx = Math.round(((phase % 1) + 1) % 1 * 8) % 8;
  return PHASE_IDS[idx];
}

/**
 * Find the next moment when the phase value crosses `target` (0, 0.25, 0.5, 0.75)
 * after `from`. Coarse 3-hour scan + bisection to ~1 minute.
 */
export function nextPhaseTime(from: Date, target: number): Date {
  const phaseDelta = (t: Date) => {
    // signed distance from target in cycle space (-0.5..0.5)
    let d = getMoonIllumination(t).phase - target;
    d = ((d % 1) + 1) % 1;
    if (d > 0.5) d -= 1;
    return d;
  };

  const stepMs = 3 * 60 * 60 * 1000;
  let t0 = new Date(from.valueOf());
  let d0 = phaseDelta(t0);
  // The phase value increases monotonically; find the first sign change from
  // negative to positive (crossing the target going forward).
  for (let i = 0; i < (LUNAR_CYCLE_DAYS * 24) / 3 + 8; i++) {
    const t1 = new Date(t0.valueOf() + stepMs);
    const d1 = phaseDelta(t1);
    if (d0 < 0 && d1 >= 0) {
      // bisect
      let lo = t0.valueOf();
      let hi = t1.valueOf();
      for (let j = 0; j < 24; j++) {
        const mid = (lo + hi) / 2;
        if (phaseDelta(new Date(mid)) < 0) lo = mid;
        else hi = mid;
      }
      return new Date((lo + hi) / 2);
    }
    t0 = t1;
    d0 = d1;
  }
  // Fallback (should never happen): one cycle out
  return new Date(from.valueOf() + LUNAR_CYCLE_DAYS * DAY_MS);
}

export interface NextPhaseEvent {
  id: MoonPhaseId;
  date: Date;
}

/** Next new moon, first quarter, full moon, and last quarter (sorted soonest first) */
export function getNextPhaseEvents(from: Date): NextPhaseEvent[] {
  const events: NextPhaseEvent[] = [
    { id: 'new_moon', date: nextPhaseTime(from, 0) },
    { id: 'first_quarter', date: nextPhaseTime(from, 0.25) },
    { id: 'full_moon', date: nextPhaseTime(from, 0.5) },
    { id: 'last_quarter', date: nextPhaseTime(from, 0.75) },
  ];
  return events.sort((a, b) => a.date.valueOf() - b.date.valueOf());
}

// ─── Aggregate snapshot used by the Lunar Phase module ────────────────────────

export interface MoonSnapshot {
  date: Date;
  phase: number;
  phaseId: MoonPhaseId;
  /** Days into the lunation */
  ageDays: number;
  /** Illuminated fraction 0..1 */
  fraction: number;
  position: MoonPosition;
  times: MoonTimes;
  transit: { time: Date; altitudeDegrees: number } | null;
  nextFullMoon: Date;
  nextNewMoon: Date;
  nextEvent: NextPhaseEvent;
}

export function getMoonSnapshot(date: Date, lat: number, lng: number): MoonSnapshot {
  const ill = getMoonIllumination(date);
  const events = getNextPhaseEvents(date);
  const nextFull = events.find(e => e.id === 'full_moon')!;
  const nextNew = events.find(e => e.id === 'new_moon')!;
  return {
    date,
    phase: ill.phase,
    phaseId: getPhaseId(ill.phase),
    ageDays: ill.phase * LUNAR_CYCLE_DAYS,
    fraction: ill.fraction,
    position: getMoonPosition(date, lat, lng),
    times: getMoonTimes(date, lat, lng),
    transit: getMoonTransit(date, lat, lng),
    nextFullMoon: nextFull.date,
    nextNewMoon: nextNew.date,
    nextEvent: events[0],
  };
}

/** 16-point compass index (0 = N) from azimuth degrees */
export function compassIndex(azimuthDegrees: number): number {
  return Math.round((((azimuthDegrees % 360) + 360) % 360) / 22.5) % 16;
}

export const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;
