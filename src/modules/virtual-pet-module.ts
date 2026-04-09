import { TemplateResult, html, nothing, svg } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { localize } from '../localize/localize';
import {
  CardModule,
  VirtualPetModule,
  PetEntityBinding,
  PetSpecies,
  PetMood,
  UltraCardConfig,
} from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

// ------------------------------------------------------------------
// Temperature Presets
// ------------------------------------------------------------------

const TEMP_PRESETS: Record<string, { label: string; cold: number; min: number; max: number; hot: number }> = {
  indoor_f:  { label: 'Indoor (°F)',      cold: 58,  min: 65, max: 78, hot: 85 },
  indoor_c:  { label: 'Indoor (°C)',      cold: 14,  min: 18, max: 26, hot: 30 },
  outdoor_f: { label: 'Outdoor (°F)',     cold: 32,  min: 55, max: 85, hot: 100 },
  outdoor_c: { label: 'Outdoor (°C)',     cold: 0,   min: 13, max: 30, hot: 38 },
  server_f:  { label: 'Server Room (°F)', cold: 55,  min: 60, max: 75, hot: 85 },
  server_c:  { label: 'Server Room (°C)', cold: 13,  min: 16, max: 24, hot: 30 },
  pool_f:    { label: 'Pool/Spa (°F)',    cold: 70,  min: 78, max: 88, hot: 95 },
  pool_c:    { label: 'Pool/Spa (°C)',    cold: 21,  min: 26, max: 31, hot: 35 },
  custom:    { label: 'Custom',           cold: 0,   min: 18, max: 26, hot: 40 },
};

// ------------------------------------------------------------------
// Mood Engine
// ------------------------------------------------------------------

interface MoodState {
  mood: PetMood;
  happiness: number;   // 0-100
  energy: number;      // 0-100
  temperature: number; // 0-100 (50 = comfortable)
  activity: number;    // 0-100
  security: number;    // 0-100
}

function rangeScore(value: number, lo: number, hi: number): number {
  if (lo > hi) { const t = lo; lo = hi; hi = t; }
  const falloff = (hi - lo) || 1;
  if (value >= lo && value <= hi) return 90;
  const dist = value < lo ? lo - value : value - hi;
  return Math.max(0, Math.round(90 * (1 - dist / falloff)));
}

function computeMoodState(
  bindings: PetEntityBinding[],
  hass: HomeAssistant
): MoodState {
  let happinessSum = 0;
  let happinessWeight = 0;
  let energySum = 0;
  let energyWeight = 0;
  let temperatureVal = 50;
  let hasTemp = false;
  let activitySum = 0;
  let activityWeight = 0;
  let securitySum = 0;
  let securityWeight = 0;

  for (const binding of bindings) {
    const stateObj = hass.states[binding.entity];
    if (!stateObj) continue;

    const weight = binding.weight ?? 1;
    const state = stateObj.state;
    const numVal = parseFloat(state);
    const hasRange = binding.range_min !== undefined && binding.range_max !== undefined;

    switch (binding.role) {
      case 'happiness': {
        let score = 50;
        if (binding.happy_state && state === binding.happy_state) score = 100;
        else if (binding.sad_state && state === binding.sad_state) score = 0;
        else if (!isNaN(numVal) && hasRange) score = rangeScore(numVal, binding.range_min!, binding.range_max!);
        else if (!isNaN(numVal)) score = Math.min(100, Math.max(0, numVal));
        else if (state === 'on' || state === 'home') score = 80;
        else if (state === 'off' || state === 'not_home') score = 30;
        if (binding.invert) score = 100 - score;
        happinessSum += score * weight;
        happinessWeight += weight;
        break;
      }
      case 'energy': {
        let score = 50;
        if (!isNaN(numVal) && hasRange) score = rangeScore(numVal, binding.range_min!, binding.range_max!);
        else if (!isNaN(numVal)) score = Math.min(100, Math.max(0, numVal));
        else if (state === 'on') score = 80;
        else if (state === 'off') score = 20;
        if (binding.invert) score = 100 - score;
        energySum += score * weight;
        energyWeight += weight;
        break;
      }
      case 'temperature': {
        if (!isNaN(numVal)) {
          const preset = binding.temp_preset && TEMP_PRESETS[binding.temp_preset]
            ? TEMP_PRESETS[binding.temp_preset]
            : null;
          const cT = binding.cold_threshold ?? preset?.cold ?? 14;
          const rMin = binding.range_min ?? preset?.min ?? 18;
          const rMax = binding.range_max ?? preset?.max ?? 26;
          const hT = binding.hot_threshold ?? preset?.hot ?? 30;

          const [sC, sMin, sMax, sH] = [cT, rMin, rMax, hT].sort((a, b) => a - b);

          if (numVal <= sC) {
            temperatureVal = 0;
          } else if (numVal < sMin) {
            temperatureVal = 15 + ((numVal - sC) / ((sMin - sC) || 1)) * 25;
          } else if (numVal <= sMax) {
            temperatureVal = 50;
          } else if (numVal < sH) {
            temperatureVal = 60 + ((numVal - sMax) / ((sH - sMax) || 1)) * 25;
          } else {
            temperatureVal = 100;
          }
          hasTemp = true;
        }
        break;
      }
      case 'activity': {
        let score = 50;
        if (!isNaN(numVal) && hasRange) score = rangeScore(numVal, binding.range_min!, binding.range_max!);
        else if (!isNaN(numVal)) score = Math.min(100, Math.max(0, numVal));
        else if (state === 'on' || state === 'detected') score = 90;
        else if (state === 'off' || state === 'clear') score = 10;
        if (binding.invert) score = 100 - score;
        activitySum += score * weight;
        activityWeight += weight;
        break;
      }
      case 'security': {
        let score = 80;
        if (state === 'armed_home' || state === 'armed_away') score = 100;
        else if (state === 'disarmed') score = 60;
        else if (state === 'triggered') score = 5;
        else if (state === 'locked') score = 100;
        else if (state === 'unlocked') score = 30;
        else if (state === 'on') score = 20;
        else if (state === 'off') score = 90;
        if (binding.invert) score = 100 - score;
        securitySum += score * weight;
        securityWeight += weight;
        break;
      }
      case 'custom': {
        let score = 50;
        if (binding.happy_state && state === binding.happy_state) score = 100;
        else if (binding.sad_state && state === binding.sad_state) score = 0;
        else if (!isNaN(numVal) && hasRange) score = rangeScore(numVal, binding.range_min!, binding.range_max!);
        else if (!isNaN(numVal)) score = Math.min(100, Math.max(0, numVal));
        if (binding.invert) score = 100 - score;
        happinessSum += score * weight;
        happinessWeight += weight;
        break;
      }
    }
  }

  const happiness = happinessWeight > 0 ? happinessSum / happinessWeight : 60;
  const energy = energyWeight > 0 ? energySum / energyWeight : 60;
  const temperature = hasTemp ? temperatureVal : 50;
  const activity = activityWeight > 0 ? activitySum / activityWeight : 40;
  const security = securityWeight > 0 ? securitySum / securityWeight : 80;

  const mood = deriveMood(happiness, energy, temperature, security);

  return { mood, happiness, energy, temperature, activity, security };
}

function deriveMood(
  happiness: number,
  energy: number,
  temperature: number,
  security: number
): PetMood {
  if (security < 20) return 'alert';
  if (temperature > 85) return 'hot';
  if (temperature < 15) return 'cold';
  if (energy < 15) return 'sleepy';
  if (happiness >= 85 && energy >= 60) return 'ecstatic';
  if (happiness >= 65) return 'happy';
  if (happiness >= 45) return 'content';
  if (happiness >= 30) return 'neutral';
  if (happiness >= 15) return 'bored';
  return 'sad';
}

// ------------------------------------------------------------------
// Speech Bubble Messages
// ------------------------------------------------------------------

const SPEECH_MESSAGES: Record<PetMood, string[]> = {
  ecstatic: [
    'Everything is perfect! 🎉',
    'Best home ever! ✨',
    'I love it here! 💖',
    'So much energy today!',
  ],
  happy: [
    'Feeling great!',
    'Life is good 😊',
    'What a nice day!',
    'Cozy and happy!',
  ],
  content: [
    'All is well.',
    'Doing just fine.',
    'Comfortable 😌',
    'Can\'t complain!',
  ],
  neutral: [
    'Hmm...',
    'It\'s okay, I guess.',
    'Not bad, not great.',
    'Just chilling.',
  ],
  bored: [
    'Kinda boring here...',
    '*yawn*',
    'Anything happening?',
    'Could be more fun...',
  ],
  sad: [
    'Not feeling it today...',
    'A bit gloomy 😢',
    'Miss the sunshine.',
    'Could use a hug.',
  ],
  sleepy: [
    'Zzz... 💤',
    'So tired...',
    'Need a nap...',
    'Five more minutes...',
  ],
  cold: [
    'Brrr! So cold! 🥶',
    'Need a blanket!',
    'Turn up the heat!',
    'Freezing here!',
  ],
  hot: [
    'So hot! 🥵',
    'Need some AC!',
    'Melting over here!',
    'Too warm!',
  ],
  alert: [
    'Something is wrong! ⚠️',
    'Check the security!',
    'Stay alert! 👀',
    'Danger detected!',
  ],
};

function getSpeechMessage(mood: PetMood): string {
  const messages = SPEECH_MESSAGES[mood];
  const idx = Math.floor(Date.now() / 30000) % messages.length;
  return messages[idx];
}

// ------------------------------------------------------------------
// 8-Bit Pixel Art Rendering System
// ------------------------------------------------------------------

const PX = 10;

function renderPixelArt(
  map: string[],
  ox: number,
  oy: number,
  palette: Record<string, string>
): TemplateResult {
  const rects: TemplateResult[] = [];
  for (let row = 0; row < map.length; row++) {
    const line = map[row];
    let col = 0;
    while (col < line.length) {
      const ch = line[col];
      if (ch !== '.' && palette[ch]) {
        let w = 1;
        while (col + w < line.length && line[col + w] === ch) w++;
        rects.push(svg`<rect x="${ox + col * PX}" y="${oy + row * PX}" width="${w * PX}" height="${PX}" fill="${palette[ch]}"/>`);
        col += w;
      } else {
        col++;
      }
    }
  }
  return svg`${rects}`;
}

function pxRect(
  ox: number, oy: number,
  gx: number, gy: number,
  color: string,
  w = 1, h = 1
): TemplateResult {
  return svg`<rect x="${ox + gx * PX}" y="${oy + gy * PX}" width="${w * PX}" height="${h * PX}" fill="${color}"/>`;
}

interface FaceCoords {
  eyeL: [number, number];
  eyeR: [number, number];
  mouth: [number, number];
  nosePos?: [number, number];
  noseW?: number;
  noseColor?: string;
}

const FACE_COORDS: Record<PetSpecies, FaceCoords> = {
  cat:     { eyeL: [5, 5],  eyeR: [10, 5],  mouth: [7, 7],  nosePos: [7, 6],  noseW: 2, noseColor: '#FF8A9E' },
  dog:     { eyeL: [5, 4],  eyeR: [10, 4],  mouth: [7, 7],  nosePos: [7, 5],  noseW: 2, noseColor: '#333' },
  fox:     { eyeL: [5, 6],  eyeR: [10, 6],  mouth: [7, 8],  nosePos: [7, 7],  noseW: 2, noseColor: '#333' },
  rabbit:  { eyeL: [5, 5],  eyeR: [10, 5],  mouth: [7, 7],  nosePos: [7, 6],  noseW: 2, noseColor: '#FF8A9E' },
  owl:     { eyeL: [4, 4],  eyeR: [11, 4],  mouth: [7, 6],  nosePos: [7, 5],  noseW: 2, noseColor: '#F4A623' },
  penguin: { eyeL: [5, 3],  eyeR: [10, 3],  mouth: [7, 5],  nosePos: [7, 4],  noseW: 2, noseColor: '#F4A623' },
  robot:   { eyeL: [5, 4],  eyeR: [10, 4],  mouth: [7, 5] },
  shrimp:  { eyeL: [5, 3],  eyeR: [10, 3],  mouth: [7, 5] },
  snail:   { eyeL: [3, 1],  eyeR: [6, 1],   mouth: [4, 6] },
  snake:   { eyeL: [5, 3],  eyeR: [10, 3],  mouth: [7, 5] },
  turtle:  { eyeL: [5, 5],  eyeR: [10, 5],  mouth: [7, 7] },
  frog:    { eyeL: [1, 1],  eyeR: [13, 1],  mouth: [7, 6] },
};

const MOOD_EYES: Record<PetMood, string> = {
  ecstatic: 'star',
  happy: 'happy',
  content: 'open',
  neutral: 'open',
  bored: 'half',
  sad: 'sad',
  sleepy: 'closed',
  cold: 'squint',
  hot: 'squint',
  alert: 'wide',
};

const MOOD_MOUTH: Record<PetMood, string> = {
  ecstatic: 'big-smile',
  happy: 'smile',
  content: 'smile',
  neutral: 'neutral',
  bored: 'neutral',
  sad: 'frown',
  sleepy: 'o',
  cold: 'wavy',
  hot: 'open',
  alert: 'o',
};

const SPECIES_MAPS: Record<PetSpecies, string[]> = {
  cat: [
    '..pp........pp..',
    '.pppp......pppp.',
    '.pspp......ppsp.',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '...pppppppppp...',
    '..ppsssssssspp..',
    '..ppsssssssspp..',
    '..pppppppppppp..',
    '...ppp....ppp...',
    '...ppp....ppp...',
  ],
  dog: [
    '....pppppppp....',
    '...pppppppppp...',
    '..pppppppppppp..',
    'ssppppppppppppss',
    'ssppppppppppppss',
    '.s.pppppppppp.s.',
    '...ppppsspppp...',
    '....pppppppp....',
    '...pppppppppp...',
    '..ppppsssspppp..',
    '..ppppsssspppp..',
    '..pppppppppppp..',
    '...ppp....ppp...',
    '...ppp....ppp...',
  ],
  fox: [
    '.pp..........pp.',
    'pppp........pppp',
    'pssp........pssp',
    'pppp........pppp',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..ppppsssspppp..',
    '..ppppsssspppp..',
    '...pppppppppp...',
    '...ppsssssspp...',
    '...ppsssssspp...',
    '...ddd....ddd...',
    '...ddd....ddd...',
  ],
  rabbit: [
    '...pp......pp...',
    '...pp......pp...',
    '...ps......sp...',
    '...pp......pp...',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '...pppppppppp...',
    '...pppppppppp...',
    '..ppppsssspppp..',
    '..ppppsssspppp..',
    '..pppppppppppp..',
    '...ppp....ppp...',
    '...ppp....ppp...',
  ],
  owl: [
    '..pp........pp..',
    '..pppppppppppp..',
    '.pppppppppppppp.',
    '.ppssppppppsspp.',
    '.ppssppppppsspp.',
    '.pppppppppppppp.',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppssssssppp..',
    '..pppssssssppp..',
    '..pppppppppppp..',
    '...pppppppppp...',
    '....oo....oo....',
    '................',
  ],
  penguin: [
    '.....pppppp.....',
    '....pppppppp....',
    '...pppppppppp...',
    '..pppppppppppp..',
    '.pppssssssssppp.',
    '.pppssssssssppp.',
    '.pppssssssssppp.',
    '.pppssssssssppp.',
    '..ppsssssssspp..',
    '...pppppppppp...',
    '....pppppppp....',
    '.....pppppp.....',
    '....oo....oo....',
    '................',
  ],
  robot: [
    '......pppp......',
    '.....pppppp.....',
    '...pppppppppp...',
    '...pppppppppp...',
    '...pppppppppp...',
    '...pppppppppp...',
    '..pppppppppppp..',
    '..ppppsssspppp..',
    '..ppppsssspppp..',
    '..pppppppppppp..',
    'pp.pppppppppp.pp',
    'pp.pppppppppp.pp',
    '...ppp....ppp...',
    '...ppp....ppp...',
  ],
  shrimp: [
    '..ss..........ss',
    '...ss........ss.',
    '....pppppppp....',
    '...pppppppppp...',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '...ppsssssspp...',
    '....pppppppp....',
    '.....pppppp.....',
    '......pppp......',
    '......pppp......',
    '.....pppp.......',
    '....pppp........',
    '...ppp..........',
  ],
  snail: [
    '...p.....p......',
    '...p.....p......',
    '..pp....pp......',
    '..pppppppp......',
    '..pppppp........',
    '..ppppppdddddd..',
    '.pppppdddsssddd.',
    '.ppppddssddssddd',
    '.ppppddssddssddd',
    '.pppppdddsssddd.',
    '..ppppppdddddd..',
    'dddddddddddddddd',
    '................',
    '................',
  ],
  snake: [
    '................',
    '....pppppppp....',
    '...pppppppppp...',
    '...pppppppppp...',
    '...pppppppppp...',
    '...ssppppppss...',
    '....ssssssss....',
    '........ssss....',
    '......ssss......',
    '....ssss........',
    '..ssss..........',
    '..ss............',
    '................',
    '................',
  ],
  turtle: [
    '................',
    '................',
    '...pppp.........',
    '...pppp.........',
    '..ppppdddddddd.',
    '..ppppddssdddd..',
    '.pp.pddddddssdd.',
    '.pp.pddssdddddd.',
    '..ppppdddddddd..',
    '..ppppdddddddd..',
    '....pp.pp..pp.pp',
    '....pp.pp..pp.pp',
    '................',
    '................',
  ],
  frog: [
    '.pp..........pp.',
    'pppp........pppp',
    'pppp........pppp',
    '.pppppppppppppp.',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..ppppsssspppp..',
    '..ppsssssssspp..',
    '..ppsssssssspp..',
    '...pppppppppp...',
    '..pp.pp..pp.pp..',
    '.pp..pp..pp..pp.',
    '.pp..........pp.',
    '................',
  ],
};

function renderPetSVG(
  species: PetSpecies,
  mood: PetMood,
  primaryColor: string,
  secondaryColor: string,
  size: number,
  animate: boolean
): TemplateResult {
  const ox = 20;
  const oy = 15;
  const face = FACE_COORDS[species];
  const palette: Record<string, string> = {
    p: primaryColor,
    s: secondaryColor,
    d: '#2A2A2A',
    o: '#F4A623',
  };

  const idleClass = animate ? 'pet-pixel-idle' : '';
  const shiverClass = mood === 'cold' && animate ? 'pet-pixel-shiver' : '';

  return svg`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}"
         style="image-rendering: pixelated; overflow: visible;">
      ${renderPixelArt(
        ['....pppppppppp..', '.....pppppppp...'],
        ox, oy + 15 * PX,
        { p: 'rgba(0,0,0,0.08)' }
      )}
      <g class="${idleClass} ${shiverClass}">
        ${renderPixelArt(SPECIES_MAPS[species] || SPECIES_MAPS.cat, ox, oy, palette)}
        ${renderPixelTail(species, primaryColor, secondaryColor, ox, oy, animate)}
        ${renderPixelEyes(MOOD_EYES[mood], face, ox, oy)}
        ${face.nosePos && face.noseColor
          ? pxRect(ox, oy, face.nosePos[0], face.nosePos[1], face.noseColor, face.noseW || 1)
          : nothing}
        ${renderPixelMouth(MOOD_MOUTH[mood], face.mouth, ox, oy)}
        ${species === 'robot' ? renderRobotExtras(secondaryColor, ox, oy) : nothing}
        ${nothing}
        ${mood === 'sleepy' ? renderPixelZzz(ox, oy) : nothing}
        ${mood === 'hot' ? renderPixelSweat(ox, oy) : nothing}
        ${mood === 'alert' ? renderPixelExcl(ox, oy) : nothing}
      </g>
    </svg>
  `;
}

function renderPixelTail(
  species: PetSpecies,
  primary: string,
  secondary: string,
  ox: number, oy: number,
  animate: boolean
): TemplateResult {
  const cls = animate ? 'pet-pixel-tail' : '';
  switch (species) {
    case 'cat':
      return svg`<g class="${cls}">
        ${pxRect(ox, oy, 14, 9, primary)} ${pxRect(ox, oy, 15, 8, primary)} ${pxRect(ox, oy, 15, 7, primary)}
      </g>`;
    case 'dog':
      return svg`<g class="${cls}">
        ${pxRect(ox, oy, 14, 8, primary)} ${pxRect(ox, oy, 15, 7, primary)}
      </g>`;
    case 'fox':
      return svg`<g class="${cls}">
        ${pxRect(ox, oy, 14, 9, primary)} ${pxRect(ox, oy, 15, 9, primary)}
        ${pxRect(ox, oy, 15, 8, primary)} ${pxRect(ox, oy, 16, 8, secondary)}
      </g>`;
    case 'rabbit':
      return svg`${pxRect(ox, oy, 13, 9, secondary)} ${pxRect(ox, oy, 14, 9, secondary)} ${pxRect(ox, oy, 13, 10, secondary)}`;
    case 'penguin':
      return svg`${pxRect(ox, oy, 0, 5, primary)} ${pxRect(ox, oy, 0, 6, primary)} ${pxRect(ox, oy, 15, 5, primary)} ${pxRect(ox, oy, 15, 6, primary)}`;
    case 'snake':
      return svg``;
    case 'turtle':
      return svg``;
    case 'frog':
      return svg``;
    case 'shrimp':
      return svg`<g class="${cls}">
        ${pxRect(ox, oy, 6, 12, primary)} ${pxRect(ox, oy, 7, 11, primary)}
        ${pxRect(ox, oy, 8, 12, primary)} ${pxRect(ox, oy, 9, 11, primary)}
      </g>`;
    case 'snail':
      return svg``;
    default:
      return svg``;
  }
}

function renderPixelEyes(
  type: string,
  face: FaceCoords,
  ox: number, oy: number
): TemplateResult {
  const [lx, ly] = face.eyeL;
  const [rx, ry] = face.eyeR;
  const D = '#1A1A1A';
  const W = '#FFFFFF';

  switch (type) {
    case 'star':
      return svg`
        ${pxRect(ox, oy, lx, ly - 1, D)} ${pxRect(ox, oy, lx - 1, ly, D)} ${pxRect(ox, oy, lx, ly, D)} ${pxRect(ox, oy, lx + 1, ly, D)} ${pxRect(ox, oy, lx, ly + 1, D)}
        ${pxRect(ox, oy, rx, ry - 1, D)} ${pxRect(ox, oy, rx - 1, ry, D)} ${pxRect(ox, oy, rx, ry, D)} ${pxRect(ox, oy, rx + 1, ry, D)} ${pxRect(ox, oy, rx, ry + 1, D)}
      `;
    case 'happy':
      return svg`
        ${pxRect(ox, oy, lx - 1, ly, D)} ${pxRect(ox, oy, lx + 1, ly, D)} ${pxRect(ox, oy, lx, ly - 1, D)}
        ${pxRect(ox, oy, rx - 1, ry, D)} ${pxRect(ox, oy, rx + 1, ry, D)} ${pxRect(ox, oy, rx, ry - 1, D)}
      `;
    case 'open':
      return svg`
        ${pxRect(ox, oy, lx, ly, D)} ${pxRect(ox, oy, lx + 1, ly, W)}
        ${pxRect(ox, oy, rx, ry, D)} ${pxRect(ox, oy, rx + 1, ry, W)}
      `;
    case 'half':
      return svg`
        ${pxRect(ox, oy, lx, ly, D, 2, 1)}
        ${pxRect(ox, oy, rx, ry, D, 2, 1)}
      `;
    case 'sad':
      return svg`
        ${pxRect(ox, oy, lx, ly, D)} ${pxRect(ox, oy, lx + 1, ly, W)}
        ${pxRect(ox, oy, rx, ry, D)} ${pxRect(ox, oy, rx + 1, ry, W)}
        ${pxRect(ox, oy, lx - 1, ly - 1, D)} ${pxRect(ox, oy, lx, ly - 1, D)}
        ${pxRect(ox, oy, rx + 1, ry - 1, D)} ${pxRect(ox, oy, rx + 2, ry - 1, D)}
      `;
    case 'closed':
      return svg`
        ${pxRect(ox, oy, lx, ly, D, 2, 1)}
        ${pxRect(ox, oy, rx, ry, D, 2, 1)}
      `;
    case 'squint':
      return svg`
        ${pxRect(ox, oy, lx, ly, D)}
        ${pxRect(ox, oy, rx, ry, D)}
      `;
    case 'wide':
      return svg`
        ${pxRect(ox, oy, lx, ly, W, 2, 2)} ${pxRect(ox, oy, lx, ly, D)} ${pxRect(ox, oy, lx + 1, ly + 1, D)}
        ${pxRect(ox, oy, rx, ry, W, 2, 2)} ${pxRect(ox, oy, rx, ry, D)} ${pxRect(ox, oy, rx + 1, ry + 1, D)}
      `;
    default:
      return svg`${pxRect(ox, oy, lx, ly, D)} ${pxRect(ox, oy, rx, ry, D)}`;
  }
}

function renderPixelMouth(
  type: string,
  center: [number, number],
  ox: number, oy: number
): TemplateResult {
  const [cx, cy] = center;
  const D = '#1A1A1A';

  switch (type) {
    case 'big-smile':
      return svg`${pxRect(ox, oy, cx - 1, cy, D)} ${pxRect(ox, oy, cx + 2, cy, D)} ${pxRect(ox, oy, cx, cy + 1, D, 2, 1)}`;
    case 'smile':
      return svg`${pxRect(ox, oy, cx - 1, cy, D)} ${pxRect(ox, oy, cx + 2, cy, D)} ${pxRect(ox, oy, cx, cy + 1, D)} ${pxRect(ox, oy, cx + 1, cy + 1, D)}`;
    case 'neutral':
      return svg`${pxRect(ox, oy, cx, cy, D, 2, 1)}`;
    case 'frown':
      return svg`${pxRect(ox, oy, cx, cy, D, 2, 1)} ${pxRect(ox, oy, cx - 1, cy + 1, D)} ${pxRect(ox, oy, cx + 2, cy + 1, D)}`;
    case 'o':
      return svg`${pxRect(ox, oy, cx, cy, D, 2, 2)}`;
    case 'wavy':
      return svg`${pxRect(ox, oy, cx - 1, cy + 1, D)} ${pxRect(ox, oy, cx, cy, D)} ${pxRect(ox, oy, cx + 1, cy + 1, D)} ${pxRect(ox, oy, cx + 2, cy, D)}`;
    case 'open':
      return svg`${pxRect(ox, oy, cx, cy, D, 3, 1)}`;
    default:
      return svg``;
  }
}

function renderRobotExtras(secondary: string, ox: number, oy: number): TemplateResult {
  return svg`
    <rect x="${ox + 7 * PX}" y="${oy}" width="${PX * 2}" height="${PX}" fill="${secondary}">
      <animate attributeName="fill" values="${secondary};#FF5252;${secondary}" dur="2s" repeatCount="indefinite"/>
    </rect>
  `;
}

function renderPixelSparkles(ox: number, oy: number): TemplateResult {
  const Y = '#FFD600';
  const W = '#FFFFFF';
  return svg`
    <g opacity="0.9">
      ${pxRect(ox, oy, 0, 1, Y)}
      ${pxRect(ox, oy, 2, 4, W)}
      ${pxRect(ox, oy, 15, 0, W)}
      ${pxRect(ox, oy, 14, 3, Y)}
    </g>
  `;
}

function renderPixelZzz(ox: number, oy: number): TemplateResult {
  const C = 'var(--primary-color)';
  return svg`
    <g opacity="0.7">
      ${pxRect(ox, oy, 14, 1, C)} ${pxRect(ox, oy, 15, 1, C)} ${pxRect(ox, oy, 15, 2, C)} ${pxRect(ox, oy, 14, 3, C)} ${pxRect(ox, oy, 15, 3, C)}
    </g>
    <g opacity="0.4">
      ${pxRect(ox, oy, 16, 0, C)}
    </g>
  `;
}

function renderPixelSweat(ox: number, oy: number): TemplateResult {
  return svg`
    <rect x="${ox + 15 * PX}" y="${oy + 2 * PX}" width="${PX}" height="${PX * 2}" fill="#64B5F6" opacity="0.7">
      <animate attributeName="y" values="${oy + 2 * PX};${oy + 5 * PX};${oy + 2 * PX}" dur="1.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
    </rect>
  `;
}

function renderPixelExcl(ox: number, oy: number): TemplateResult {
  const R = '#FF5252';
  return svg`${pxRect(ox, oy, 16, 0, R)} ${pxRect(ox, oy, 16, 1, R)} ${pxRect(ox, oy, 16, 2, R)} ${pxRect(ox, oy, 16, 4, R)}`;
}

// ------------------------------------------------------------------
// MODULE CLASS
// ------------------------------------------------------------------

export class UltraVirtualPetModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'virtual_pet',
    title: 'Virtual Pet',
    description: 'A digital pet whose mood is driven by your smart home data',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:paw',
    category: 'interactive',
    tags: ['pet', 'fun', 'tamagotchi', 'animated', 'interactive', 'pro', 'premium'],
  };

  private _expandedBindings: Set<string> = new Set();

  createDefault(id?: string): VirtualPetModule {
    return {
      id: id || this.generateId('virtual_pet'),
      type: 'virtual_pet',
      pet_name: 'Buddy',
      species: 'cat',
      entity_bindings: [],
      show_name: true,
      show_mood: true,
      show_stats: true,
      show_speech_bubble: true,
      show_background_scene: true,
      pet_size: 160,
      background_scene: 'auto',
      enable_animations: true,
      enable_particles: false,
      enable_idle_animations: true,
      lcd_filter: true,
      accent_color: '',
      pet_primary_color: '',
      pet_secondary_color: '',
      bubble_color: '',
      stats_color: '',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const petModule = module as VirtualPetModule;
    const errors = [...baseValidation.errors];
    if (!petModule.pet_name || petModule.pet_name.trim() === '') {
      errors.push('Pet name is required');
    }
    return { valid: errors.length === 0, errors };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as VirtualPetModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as VirtualPetModule, hass, updates =>
      updateModule(updates)
    );
  }

  // ==================================================================
  // GENERAL TAB (EDITOR)
  // ==================================================================

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const pet = module as VirtualPetModule;
    return html`
      ${this.injectUcFormStyles()}
      <style>${this._editorStyles()}</style>

      <div class="module-settings">
        <!-- Pet Identity -->
        <div class="settings-section">
          <div class="section-title">PET IDENTITY</div>
          ${UcFormUtils.renderFieldSection(
            'Pet Name',
            'Give your pet a name!',
            hass,
            { pet_name: pet.pet_name || 'Buddy' },
            [UcFormUtils.text('pet_name')],
            (e: CustomEvent) => { updateModule({ pet_name: e.detail.value.pet_name } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); }
          )}
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Species</div>
          <div class="species-grid">
            ${(
              [
                { id: 'cat', icon: 'mdi:cat', label: 'Cat' },
                { id: 'dog', icon: 'mdi:dog', label: 'Dog' },
                { id: 'fox', icon: 'mdi:firefox', label: 'Fox' },
                { id: 'rabbit', icon: 'mdi:rabbit', label: 'Rabbit' },
                { id: 'owl', icon: 'mdi:owl', label: 'Owl' },
                { id: 'penguin', icon: 'mdi:penguin', label: 'Penguin' },
                { id: 'robot', icon: 'mdi:robot', label: 'Robot' },
                { id: 'shrimp', icon: 'mdi:fish', label: 'Shrimp' },
                { id: 'snail', icon: 'mdi:bug', label: 'Snail' },
                { id: 'snake', icon: 'mdi:snake', label: 'Snake' },
                { id: 'turtle', icon: 'mdi:turtle', label: 'Turtle' },
                { id: 'frog', icon: 'mdi:spa', label: 'Frog' },
              ] as { id: PetSpecies; icon: string; label: string }[]
            ).map(
              s => html`
                <div
                  class="species-btn ${pet.species === s.id ? 'active' : ''}"
                  @click=${() => { updateModule({ species: s.id } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
                >
                  <ha-icon icon="${s.icon}"></ha-icon>
                  <span>${s.label}</span>
                </div>
              `
            )}
          </div>
        </div>

        <!-- Entity Bindings -->
        <div class="settings-section">
          <div class="section-title">ENTITY BINDINGS</div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            Connect your smart home entities to influence your pet's mood.
            Each binding affects a different aspect of your pet's wellbeing.
          </div>
          ${(pet.entity_bindings || []).map((binding, index) =>
            this._renderBindingRow(binding, index, pet, hass, updateModule)
          )}
          <button
            class="add-btn full-width"
            @click=${() => {
              const bindings = [...(pet.entity_bindings || [])];
              const newBinding: PetEntityBinding = {
                id: this.generateId('pet_bind'),
                entity: '',
                role: 'happiness',
              };
              bindings.push(newBinding);
              updateModule({ entity_bindings: bindings } as any);
              this._expandedBindings.add(newBinding.id);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity Binding
          </button>
        </div>

        <!-- Display -->
        <div class="settings-section">
          <div class="section-title">DISPLAY</div>
          ${this.renderSettingsSection('', '', [
            {
              title: 'Show Name',
              description: 'Display the pet\'s name below it.',
              hass,
              data: { show_name: pet.show_name },
              schema: [this.booleanField('show_name')],
              onChange: (e: CustomEvent) => { updateModule({ show_name: e.detail.value.show_name } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            },
            {
              title: 'Show Mood',
              description: 'Display the current mood label.',
              hass,
              data: { show_mood: pet.show_mood },
              schema: [this.booleanField('show_mood')],
              onChange: (e: CustomEvent) => { updateModule({ show_mood: e.detail.value.show_mood } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            },
            {
              title: 'Show Stats',
              description: 'Display happiness, energy, and other stat bars.',
              hass,
              data: { show_stats: pet.show_stats },
              schema: [this.booleanField('show_stats')],
              onChange: (e: CustomEvent) => { updateModule({ show_stats: e.detail.value.show_stats } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            },
            {
              title: 'Show Speech Bubble',
              description: 'Display a thought bubble with mood messages.',
              hass,
              data: { show_speech_bubble: pet.show_speech_bubble },
              schema: [this.booleanField('show_speech_bubble')],
              onChange: (e: CustomEvent) => { updateModule({ show_speech_bubble: e.detail.value.show_speech_bubble } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            },
            {
              title: 'Enable Animations',
              description: 'Idle bounce, tail wag, and other animations.',
              hass,
              data: { enable_animations: pet.enable_animations },
              schema: [this.booleanField('enable_animations')],
              onChange: (e: CustomEvent) => { updateModule({ enable_animations: e.detail.value.enable_animations } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            },
            {
              title: 'LCD Filter',
              description: 'Retro LCD color overlay for an authentic screen look.',
              hass,
              data: { lcd_filter: pet.lcd_filter },
              schema: [this.booleanField('lcd_filter')],
              onChange: (e: CustomEvent) => { updateModule({ lcd_filter: e.detail.value.lcd_filter } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            },
          ])}
          ${this.renderSliderField(
            'Pet Size',
            'Size of the pet in pixels.',
            pet.pet_size || 160,
            160,
            80,
            300,
            4,
            (value: number) => { updateModule({ pet_size: value } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); },
            'px'
          )}
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">COLORS</div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            Customize your pet's colors. Leave empty for species defaults.
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Primary Color (body)'}
              .value=${pet.pet_primary_color || ''}
              .defaultValue=${this._speciesDefaults(pet.species).primary}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => { updateModule({ pet_primary_color: e.detail.value } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Secondary Color (belly, ears)'}
              .value=${pet.pet_secondary_color || ''}
              .defaultValue=${this._speciesDefaults(pet.species).secondary}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => { updateModule({ pet_secondary_color: e.detail.value } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Accent Color'}
              .value=${pet.accent_color || ''}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => { updateModule({ accent_color: e.detail.value } as any); setTimeout(() => this.triggerPreviewUpdate(), 50); }}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  private _renderBindingRow(
    binding: PetEntityBinding,
    index: number,
    pet: VirtualPetModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const isExpanded = this._expandedBindings.has(binding.id);
    const roleIcons: Record<string, string> = {
      happiness: 'mdi:emoticon-happy',
      energy: 'mdi:lightning-bolt',
      temperature: 'mdi:thermometer',
      activity: 'mdi:run',
      security: 'mdi:shield-check',
      custom: 'mdi:tune',
    };
    return html`
      <div class="binding-row">
        <ha-icon icon="${roleIcons[binding.role] || 'mdi:tune'}" style="color: var(--primary-color); flex-shrink: 0;"></ha-icon>
        <div class="binding-info ${!binding.entity ? 'empty' : ''}">
          ${binding.entity
            ? html`${binding.label || hass.states[binding.entity]?.attributes.friendly_name || binding.entity}
                <span style="opacity: 0.5; font-size: 11px; margin-left: 4px;">(${binding.role})</span>`
            : 'No entity selected'}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${isExpanded ? 'expanded' : ''}"
          @click=${(e: Event) => {
            const opening = !this._expandedBindings.has(binding.id);
            if (opening) this._expandedBindings.add(binding.id);
            else this._expandedBindings.delete(binding.id);
            const chevron = e.currentTarget as HTMLElement;
            chevron.classList.toggle('expanded', opening);
            const row = chevron.closest('.binding-row');
            const settings = row?.nextElementSibling as HTMLElement | null;
            if (settings?.classList.contains('binding-settings')) {
              settings.classList.toggle('collapsed', !opening);
            }
          }}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${() => {
            const bindings = [...(pet.entity_bindings || [])];
            bindings.splice(index, 1);
            this._expandedBindings.delete(binding.id);
            updateModule({ entity_bindings: bindings } as any);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }}
        ></ha-icon>
      </div>
      ${html`
            <div class="binding-settings ${isExpanded ? '' : 'collapsed'}">
              ${UcFormUtils.renderFieldSection(
                'Entity',
                'The entity that affects this stat.',
                hass,
                { entity: binding.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => this._updateBinding(index, { entity: e.detail.value.entity }, pet, updateModule)
              )}
              ${this.renderFieldSection(
                'Role',
                'What aspect of your pet does this entity affect?',
                hass,
                { role: binding.role || 'happiness' },
                [
                  this.selectField('role', [
                    { value: 'happiness', label: 'Happiness' },
                    { value: 'energy', label: 'Energy' },
                    { value: 'temperature', label: 'Temperature' },
                    { value: 'activity', label: 'Activity' },
                    { value: 'security', label: 'Security' },
                    { value: 'custom', label: 'Custom' },
                  ]),
                ],
                (e: CustomEvent) => this._updateBinding(index, { role: e.detail.value.role }, pet, updateModule)
              )}
              ${binding.role === 'happiness' || binding.role === 'custom'
                ? html`
                    ${UcFormUtils.renderFieldSection(
                      'Happy State',
                      'State value that makes the pet happy (e.g. "on", "home").',
                      hass,
                      { happy_state: binding.happy_state || '' },
                      [UcFormUtils.text('happy_state')],
                      (e: CustomEvent) => this._updateBinding(index, { happy_state: e.detail.value.happy_state }, pet, updateModule)
                    )}
                    ${UcFormUtils.renderFieldSection(
                      'Sad State',
                      'State value that makes the pet sad (e.g. "off", "not_home").',
                      hass,
                      { sad_state: binding.sad_state || '' },
                      [UcFormUtils.text('sad_state')],
                      (e: CustomEvent) => this._updateBinding(index, { sad_state: e.detail.value.sad_state }, pet, updateModule)
                    )}
                  `
                : ''}
              ${binding.role === 'temperature'
                ? html`
                    ${this.renderFieldSection(
                      'Temperature Preset',
                      'Quick-start ranges for common setups.',
                      hass,
                      { temp_preset: binding.temp_preset || '' },
                      [
                        this.selectField('temp_preset', [
                          { value: '', label: 'None (manual)' },
                          ...Object.entries(TEMP_PRESETS).map(([k, v]) => ({ value: k, label: v.label })),
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const presetKey = e.detail.value.temp_preset;
                        const preset = TEMP_PRESETS[presetKey];
                        if (preset) {
                          this._updateBinding(index, {
                            temp_preset: presetKey,
                            cold_threshold: preset.cold,
                            range_min: preset.min,
                            range_max: preset.max,
                            hot_threshold: preset.hot,
                          }, pet, updateModule);
                        } else {
                          this._updateBinding(index, { temp_preset: '' }, pet, updateModule);
                        }
                      }
                    )}
                    <div class="temp-zone-bar">
                      <div class="temp-zone cold" style="flex: ${Math.max(1, (binding.range_min ?? 18) - (binding.cold_threshold ?? 14))}">
                        <span>Cold</span>
                      </div>
                      <div class="temp-zone cool" style="flex: ${Math.max(1, (binding.range_min ?? 18) - (binding.cold_threshold ?? 14))}">
                        <span>Cool</span>
                      </div>
                      <div class="temp-zone comfort" style="flex: ${Math.max(1, (binding.range_max ?? 26) - (binding.range_min ?? 18))}">
                        <span>Comfort</span>
                      </div>
                      <div class="temp-zone warm" style="flex: ${Math.max(1, (binding.hot_threshold ?? 30) - (binding.range_max ?? 26))}">
                        <span>Warm</span>
                      </div>
                      <div class="temp-zone hot" style="flex: ${Math.max(1, (binding.hot_threshold ?? 30) - (binding.range_max ?? 26))}">
                        <span>Hot</span>
                      </div>
                    </div>
                    <div class="temp-thresholds">
                      ${UcFormUtils.renderFieldSection(
                        'Cold Below',
                        'Below this value the pet shivers.',
                        hass,
                        { cold_threshold: binding.cold_threshold ?? 14 },
                        [UcFormUtils.number('cold_threshold', -50, 200, 1)],
                        (e: CustomEvent) => this._updateBinding(index, { cold_threshold: e.detail.value.cold_threshold, temp_preset: 'custom' }, pet, updateModule)
                      )}
                      ${UcFormUtils.renderFieldSection(
                        'Comfort Min',
                        'Start of the comfort zone.',
                        hass,
                        { range_min: binding.range_min ?? 18 },
                        [UcFormUtils.number('range_min', -50, 200, 1)],
                        (e: CustomEvent) => this._updateBinding(index, { range_min: e.detail.value.range_min, temp_preset: 'custom' }, pet, updateModule)
                      )}
                      ${UcFormUtils.renderFieldSection(
                        'Comfort Max',
                        'End of the comfort zone.',
                        hass,
                        { range_max: binding.range_max ?? 26 },
                        [UcFormUtils.number('range_max', -50, 200, 1)],
                        (e: CustomEvent) => this._updateBinding(index, { range_max: e.detail.value.range_max, temp_preset: 'custom' }, pet, updateModule)
                      )}
                      ${UcFormUtils.renderFieldSection(
                        'Hot Above',
                        'Above this value the pet overheats.',
                        hass,
                        { hot_threshold: binding.hot_threshold ?? 30 },
                        [UcFormUtils.number('hot_threshold', -50, 200, 1)],
                        (e: CustomEvent) => this._updateBinding(index, { hot_threshold: e.detail.value.hot_threshold, temp_preset: 'custom' }, pet, updateModule)
                      )}
                    </div>
                  `
                : ''}
              ${binding.role !== 'temperature' && binding.role !== 'security'
                ? html`
                    <div class="range-fields">
                      ${UcFormUtils.renderFieldSection(
                        'Ideal Range Min',
                        'Values in this range keep your pet happy.',
                        hass,
                        { range_min: binding.range_min ?? '' },
                        [UcFormUtils.number('range_min', undefined, undefined, 1)],
                        (e: CustomEvent) => this._updateBinding(index, { range_min: e.detail.value.range_min }, pet, updateModule)
                      )}
                      ${UcFormUtils.renderFieldSection(
                        'Ideal Range Max',
                        '',
                        hass,
                        { range_max: binding.range_max ?? '' },
                        [UcFormUtils.number('range_max', undefined, undefined, 1)],
                        (e: CustomEvent) => this._updateBinding(index, { range_max: e.detail.value.range_max }, pet, updateModule)
                      )}
                    </div>
                  `
                : ''}
              ${this.renderSettingsSection('', '', [
                {
                  title: 'Invert',
                  description: 'Flip the effect (high value = unhappy).',
                  hass,
                  data: { invert: binding.invert || false },
                  schema: [this.booleanField('invert')],
                  onChange: (e: CustomEvent) => this._updateBinding(index, { invert: e.detail.value.invert }, pet, updateModule),
                },
              ])}
            </div>
          `}
    `;
  }

  private _updateBinding(
    index: number,
    updates: Partial<PetEntityBinding>,
    pet: VirtualPetModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const bindings = [...(pet.entity_bindings || [])];
    bindings[index] = { ...bindings[index], ...updates };
    updateModule({ entity_bindings: bindings } as any);
  }

  // ==================================================================
  // PREVIEW RENDERING
  // ==================================================================

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): TemplateResult {
    const pet = module as VirtualPetModule;
    const lang = hass?.locale?.language || 'en';

    if (!hass || !hass.states) {
      return this.renderGradientErrorState(
        localize('editor.virtual_pet.error_waiting_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.virtual_pet.error_waiting_ha_desc', lang, 'Connecting to entity states...'),
        'mdi:loading'
      );
    }

    const moodState =
      pet.entity_bindings && pet.entity_bindings.length > 0
        ? computeMoodState(pet.entity_bindings, hass)
        : { mood: 'content' as PetMood, happiness: 60, energy: 60, temperature: 50, activity: 40, security: 80 };

    const defaults = this._speciesDefaults(pet.species);
    const primaryColor = pet.pet_primary_color || defaults.primary;
    const secondaryColor = pet.pet_secondary_color || defaults.secondary;
    const accentColor = pet.accent_color || 'var(--primary-color)';
    const size = pet.pet_size || 160;
    const animate = pet.enable_animations !== false;

    const speechMsg = pet.show_speech_bubble ? getSpeechMessage(moodState.mood) : '';
    const lcdOn = pet.lcd_filter !== false;

    const content = html`
      <style>${this._previewStyles()}</style>
      <div class="vp-device">
        <div class="vp-screen ${lcdOn ? 'lcd-on' : ''}">
          ${pet.show_speech_bubble && speechMsg
            ? html`
                <div class="vp-bubble">
                  <span class="vp-bubble-text">"${speechMsg}"</span>
                </div>
              `
            : nothing}

          <div class="vp-pet-area">
            ${renderPetSVG(pet.species, moodState.mood, primaryColor, secondaryColor, size, animate)}
          </div>

          ${pet.show_name || pet.show_mood
            ? html`
                <div class="vp-info">
                  ${pet.show_name
                    ? html`<div class="vp-name">${pet.pet_name || 'Buddy'}</div>`
                    : nothing}
                  ${pet.show_mood
                    ? html`<div class="vp-mood" style="color: ${this._moodColor(moodState.mood)};">
                        ${this._moodEmoji(moodState.mood)} ${this._moodLabel(moodState.mood)}
                      </div>`
                    : nothing}
                </div>
              `
            : nothing}

          ${pet.show_stats
            ? html`
                <div class="vp-stats">
                  ${this._renderStatBar('HP', moodState.happiness, '#FFB300', accentColor)}
                  ${this._renderStatBar('EP', moodState.energy, '#43A047', accentColor)}
                  ${moodState.temperature !== 50
                    ? this._renderStatBar('TMP', 100 - Math.abs(moodState.temperature - 50) * 2, '#1E88E5', accentColor)
                    : nothing}
                  ${pet.entity_bindings?.some(b => b.role === 'security')
                    ? this._renderStatBar('DEF', moodState.security, '#E53935', accentColor)
                    : nothing}
                </div>
              `
            : nothing}
        </div>
      </div>
    `;

    return this.wrapWithAnimation(content, module, hass);
  }

  private _renderStatBar(
    label: string,
    value: number,
    color: string,
    _accent: string
  ): TemplateResult {
    const clamped = Math.min(100, Math.max(0, Math.round(value)));
    const filled = Math.round(clamped / 10);
    const segs: TemplateResult[] = [];
    for (let i = 0; i < 10; i++) {
      segs.push(html`<div class="vp-seg ${i < filled ? 'on' : ''}" style="${i < filled ? `background:${color};` : ''}"></div>`);
    }
    return html`
      <div class="vp-stat">
        <span class="vp-stat-lbl">${label}</span>
        <div class="vp-stat-bar">${segs}</div>
        <span class="vp-stat-val">${clamped}</span>
      </div>
    `;
  }

  // ==================================================================
  // SPECIES DEFAULTS & MOOD HELPERS
  // ==================================================================

  private _speciesDefaults(species: PetSpecies): { primary: string; secondary: string } {
    const defaults: Record<PetSpecies, { primary: string; secondary: string }> = {
      cat: { primary: '#7E57C2', secondary: '#D1C4E9' },
      dog: { primary: '#8D6E63', secondary: '#D7CCC8' },
      fox: { primary: '#FF7043', secondary: '#FFCCBC' },
      rabbit: { primary: '#EC407A', secondary: '#F8BBD0' },
      owl: { primary: '#5C6BC0', secondary: '#C5CAE9' },
      penguin: { primary: '#37474F', secondary: '#ECEFF1' },
      robot: { primary: '#78909C', secondary: '#4FC3F7' },
      shrimp: { primary: '#EF5350', secondary: '#FFCDD2' },
      snail: { primary: '#A1887F', secondary: '#8D6E63' },
      snake: { primary: '#66BB6A', secondary: '#C8E6C9' },
      turtle: { primary: '#4CAF50', secondary: '#795548' },
      frog: { primary: '#43A047', secondary: '#C8E6C9' },
    };
    return defaults[species] || defaults.cat;
  }

  private _moodLabel(mood: PetMood): string {
    const labels: Record<PetMood, string> = {
      ecstatic: 'Ecstatic',
      happy: 'Happy',
      content: 'Content',
      neutral: 'Neutral',
      bored: 'Bored',
      sad: 'Sad',
      sleepy: 'Sleepy',
      cold: 'Cold',
      hot: 'Hot',
      alert: 'Alert',
    };
    return labels[mood];
  }

  private _moodEmoji(mood: PetMood): string {
    const symbols: Record<PetMood, string> = {
      ecstatic: '★★★',
      happy: '♥',
      content: '~',
      neutral: '•',
      bored: '...',
      sad: ';;',
      sleepy: 'Zzz',
      cold: '***',
      hot: '!!!',
      alert: '⚡',
    };
    return symbols[mood];
  }

  private _moodColor(mood: PetMood): string {
    const colors: Record<PetMood, string> = {
      ecstatic: '#FFD600',
      happy: '#66BB6A',
      content: '#42A5F5',
      neutral: '#90A4AE',
      bored: '#78909C',
      sad: '#5C6BC0',
      sleepy: '#AB47BC',
      cold: '#29B6F6',
      hot: '#EF5350',
      alert: '#FF5252',
    };
    return colors[mood];
  }

  // ==================================================================
  // STYLES
  // ==================================================================

  private _editorStyles(): string {
    return `
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--primary-color);
        letter-spacing: 0.5px;
      }
      .species-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 8px;
        margin-bottom: 16px;
      }
      .species-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 14px 8px;
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        background: var(--card-background-color);
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .species-btn:hover {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.05);
      }
      .species-btn.active {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }
      .species-btn ha-icon {
        color: var(--primary-color);
        --mdc-icon-size: 28px;
      }
      .binding-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        margin-bottom: 8px;
        border: 1px solid var(--divider-color);
        transition: all 0.2s ease;
      }
      .binding-row:hover {
        background: var(--primary-color);
        opacity: 0.9;
      }
      .binding-info {
        flex: 1;
        font-size: 14px;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .binding-info.empty {
        color: var(--secondary-text-color);
        font-style: italic;
      }
      .expand-icon {
        cursor: pointer;
        color: var(--primary-color);
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .expand-icon.expanded {
        transform: rotate(180deg);
      }
      .delete-icon {
        cursor: pointer;
        color: var(--error-color);
        flex-shrink: 0;
      }
      .binding-settings {
        padding: 16px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-left: 3px solid var(--primary-color);
        border-radius: 0 8px 8px 0;
        margin-bottom: 8px;
      }
      .binding-settings.collapsed {
        display: none;
      }
      .temp-zone-bar {
        display: flex;
        height: 28px;
        border-radius: 6px;
        overflow: hidden;
        margin: 8px 0 12px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .temp-zone {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 30px;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      .temp-zone.cold { background: #42A5F5; }
      .temp-zone.cool { background: #80DEEA; color: #37474F; text-shadow: none; }
      .temp-zone.comfort { background: #66BB6A; }
      .temp-zone.warm { background: #FFA726; }
      .temp-zone.hot { background: #EF5350; }
      .temp-thresholds {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .range-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 4px;
      }
      .add-btn {
        padding: 8px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }
      .add-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .add-btn.full-width {
        width: 100%;
        justify-content: center;
        padding: 12px;
      }
    `;
  }

  private _previewStyles(): string {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

      .vp-device {
        display: flex;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
      }

      /* ---- Dot-Matrix LCD Screen ---- */
      .vp-screen {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 14px 14px;
        width: 100%;
        max-width: 320px;
        aspect-ratio: 10 / 9;
        box-sizing: border-box;
        font-family: 'Press Start 2P', 'Courier New', monospace;
        image-rendering: pixelated;
        background: #1a1e24;
        border: 2px solid rgba(255,255,255,0.08);
        overflow: hidden;
      }

      /* Dot-matrix pixel grid */
      .vp-screen::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background:
          linear-gradient(to right, rgba(0,0,0,0.18) 0px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.18) 0px, transparent 1px);
        background-size: 3px 3px;
        pointer-events: none;
        z-index: 3;
      }

      /* LCD color overlay (green tint like classic Gameboy) */
      .vp-screen.lcd-on::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(
          ellipse at center,
          rgba(132, 208, 125, 0.06) 0%,
          rgba(94, 120, 93, 0.10) 60%,
          rgba(62, 73, 67, 0.14) 100%
        );
        mix-blend-mode: screen;
        pointer-events: none;
        z-index: 4;
      }

      /* ---- Speech Bubble ---- */
      .vp-bubble {
        text-align: center;
        padding: 0 4px;
        z-index: 2;
        flex-shrink: 0;
        animation: vp-bubble-in 0.3s steps(4);
      }

      .vp-bubble-text {
        font-size: 10px;
        line-height: 1.5;
        color: var(--secondary-text-color);
        letter-spacing: 0.3px;
        font-style: italic;
      }

      @keyframes vp-bubble-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* ---- Pet (centered in remaining space) ---- */
      .vp-pet-area {
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        flex: 1;
        min-height: 0;
        margin: auto 0;
      }

      .pet-pixel-idle {
        animation: pet-px-bounce 1.6s steps(4) infinite;
      }

      @keyframes pet-px-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }

      .pet-pixel-tail {
        animation: pet-px-tail 0.5s steps(2) infinite;
      }

      @keyframes pet-px-tail {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-4px) rotate(6deg); }
      }

      .pet-pixel-shiver {
        animation: pet-px-shiver 0.12s steps(2) infinite !important;
      }

      @keyframes pet-px-shiver {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-4px); }
      }

      /* ---- Name + Mood (stacked, tight) ---- */
      .vp-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 0;
        margin-top: -20px;
        z-index: 2;
        flex-shrink: 0;
      }

      .vp-name {
        font-size: 14px;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 3px;
      }

      .vp-mood {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }

      /* ---- Stat Bars (inline HUD) ---- */
      .vp-stats {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding-top: 4px;
        z-index: 2;
        flex-shrink: 0;
      }

      .vp-stat {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .vp-stat-lbl {
        font-size: 9px;
        width: 30px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        flex-shrink: 0;
        letter-spacing: 0.5px;
      }

      .vp-stat-bar {
        display: flex;
        gap: 2px;
        flex: 1;
        height: 12px;
      }

      .vp-stat-val {
        font-size: 9px;
        width: 28px;
        text-align: right;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .vp-seg {
        flex: 1;
        background: rgba(255,255,255,0.06);
      }

      .vp-seg.on {
        box-shadow: inset 0 -2px 0 0 rgba(0,0,0,0.3);
      }
    `;
  }

  getStyles(): string {
    return `${BaseUltraModule.getSliderStyles()}`;
  }
}
