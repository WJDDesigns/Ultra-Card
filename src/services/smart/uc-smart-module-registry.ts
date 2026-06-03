import type { SmartEntityRef } from '../uc-smart-composition-planner';
import {
  SMART_CONTAINER_TYPE_SET,
  SMART_LIBRARY_ONLY_TYPES,
  SMART_MODULE_SPEC_DEFINITIONS,
} from './module-specs';
import type {
  SmartBuildContext,
  SmartModuleHandlers,
  SmartModuleSpec,
} from './smart-module-types';

let registryMap: Map<string, SmartModuleSpec> | null = null;
let composableSpecs: SmartModuleSpec[] = [];
let allSpecs: SmartModuleSpec[] = [];

export function initSmartModuleRegistry(handlers: SmartModuleHandlers = {}): Map<string, SmartModuleSpec> {
  const map = new Map<string, SmartModuleSpec>();

  for (const baseSpec of SMART_MODULE_SPEC_DEFINITIONS) {
    const handler = handlers[baseSpec.type];
    const spec: SmartModuleSpec = {
      ...baseSpec,
      ...(handler?.sanitize ? { sanitize: handler.sanitize } : {}),
      ...(handler?.defaultBuilder ? { defaultBuilder: handler.defaultBuilder } : {}),
      ...(handler?.proDowngrade ? { proDowngrade: handler.proDowngrade } : {}),
    };
    map.set(spec.type, spec);
  }

  registryMap = map;
  allSpecs = Array.from(map.values());
  composableSpecs = allSpecs.filter(spec => spec.isSmartComposable);
  return map;
}

export function getSmartModuleRegistry(): Map<string, SmartModuleSpec> {
  if (!registryMap) {
    return initSmartModuleRegistry();
  }
  return registryMap;
}

export function getSmartModuleSpec(type: string): SmartModuleSpec | undefined {
  return getSmartModuleRegistry().get(type);
}

export function getAllSmartModuleSpecs(): SmartModuleSpec[] {
  getSmartModuleRegistry();
  return allSpecs;
}

export function getComposableSmartModuleSpecs(): SmartModuleSpec[] {
  getSmartModuleRegistry();
  return composableSpecs;
}

export function isRegistrySmartModuleType(type: string): boolean {
  const spec = getSmartModuleSpec(type);
  return !!spec?.isSmartComposable;
}

export function isRegistrySmartContainerType(type: string): boolean {
  return SMART_CONTAINER_TYPE_SET.has(type);
}

export function isRegistryProSmartModule(type: string): boolean {
  return getSmartModuleSpec(type)?.tier === 'pro';
}

export function isLibraryOnlySmartModule(type: string): boolean {
  return SMART_LIBRARY_ONLY_TYPES.has(type);
}

function promptTokenSet(prompt: string): Set<string> {
  return new Set(
    prompt
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .split(/[^a-z0-9]+/)
      .map(token => token.trim())
      .filter(token => token.length >= 2)
  );
}

export type SmartModuleMatch = {
  type: string;
  score: number;
  spec: SmartModuleSpec;
};

export function scoreSmartModulePromptMatch(
  prompt: string,
  spec: SmartModuleSpec,
  tier: 'free' | 'pro' = 'pro'
): number {
  if (!spec.isSmartComposable && tier !== 'pro') {
    // Still score library modules for intent, but composable modules win ties.
  }
  if (spec.tier === 'pro' && tier === 'free') {
    // Allow matching for intent/correction but lower priority vs free alternatives.
  }

  const normalizedPrompt = prompt.toLowerCase();
  const tokens = promptTokenSet(prompt);
  let score = 0;

  const explicitTypePhrase = spec.type.replace(/_/g, ' ');
  if (normalizedPrompt.includes(explicitTypePhrase)) score += 12;
  if (normalizedPrompt.includes(spec.title.toLowerCase())) score += 8;

  for (const alias of spec.promptAliases) {
    const aliasTokens = alias.split('_').filter(Boolean);
    if (aliasTokens.length > 1) {
      if (normalizedPrompt.includes(aliasTokens.join(' '))) score += 6;
      continue;
    }
    if (tokens.has(alias)) score += 4;
  }

  for (const phrase of spec.promptPhrases || []) {
    if (phrase.test(normalizedPrompt)) score += 5;
  }

  if (!spec.isSmartComposable) score -= 2;
  return score;
}

export function matchSmartModuleTypesForPrompt(
  prompt: string,
  tier: 'free' | 'pro' = 'pro',
  options: { max?: number; composableOnly?: boolean } = {}
): SmartModuleMatch[] {
  const { max = 12, composableOnly = false } = options;
  const specs = composableOnly ? composableSpecs : allSpecs;
  if (!specs.length) getSmartModuleRegistry();

  return specs
    .map(spec => ({
      type: spec.type,
      score: scoreSmartModulePromptMatch(prompt, spec, tier),
      spec,
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

export function getForcedModuleTypeFromPrompt(
  prompt: string,
  tier: 'free' | 'pro' = 'pro'
): string | undefined {
  const matches = matchSmartModuleTypesForPrompt(prompt, tier, { max: 6, composableOnly: true });
  if (!matches.length) return undefined;

  const top = matches[0];
  const runnerUp = matches[1];
  if (!top) return undefined;

  // Require a meaningful explicit module mention.
  if (top.score < 4) return undefined;
  if (runnerUp && runnerUp.score === top.score) return undefined;
  return top.type;
}

export function inferEntityDomainsFromRegistryPrompt(prompt: string): string[] {
  const matches = matchSmartModuleTypesForPrompt(prompt, 'pro', { max: 8, composableOnly: true });
  const domains = new Set<string>();

  for (const match of matches) {
    for (const domain of match.spec.entityDomains) {
      if (domain !== '*') domains.add(domain);
    }
  }

  return Array.from(domains);
}

export function scoreEntityForModuleSpec(
  entity: SmartEntityRef,
  spec: SmartModuleSpec,
  prompt: string
): number {
  let score = 0;
  const haystack = `${entity.entityId} ${entity.name} ${entity.deviceClass || ''}`.toLowerCase();
  const context = prompt.toLowerCase();

  if (spec.entityDomains.includes('*') || spec.entityDomains.includes(entity.domain)) {
    score += 5;
  }

  for (const deviceClass of spec.deviceClasses || []) {
    if (entity.deviceClass === deviceClass) score += 12;
    if (haystack.includes(deviceClass)) score += 6;
  }

  for (const unit of spec.unitHints || []) {
    if (entity.unit === unit) score += 4;
  }

  if (spec.type === 'bar' || spec.type === 'gauge') {
    if (/\bfuel\b|\btank\b|\bgas\b/.test(context) && /\bfuel\b|\btank\b|\bgas\b/.test(haystack)) {
      score += 15;
    }
    if (entity.deviceClass === 'fuel') score += 20;
  }

  if (spec.type === 'camera' && entity.domain === 'camera') score += 20;
  if (spec.type === 'image' && entity.domain === 'camera' && /\bcamera\b|\bfeed\b/.test(context)) {
    score += 10;
  }

  return score;
}

export function findBestEntityForModuleSpec(
  inventory: SmartEntityRef[],
  spec: SmartModuleSpec,
  prompt: string,
  usedEntityIds: Set<string> = new Set()
): SmartEntityRef | undefined {
  const candidates = inventory.filter(entity => !usedEntityIds.has(entity.entityId));
  const scored = candidates
    .map(entity => ({
      entity,
      score: scoreEntityForModuleSpec(entity, spec, prompt),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) return scored[0].entity;

  const domainMatch = spec.entityDomains.find(domain => domain !== '*');
  if (domainMatch) {
    return candidates.find(entity => entity.domain === domainMatch);
  }

  return candidates[0];
}

export function getRegistryCatalogLines(tier: 'free' | 'pro'): string[] {
  return getComposableSmartModuleSpecs()
    .filter(spec => tier === 'pro' || spec.tier === 'free')
    .map(spec => {
      const keywords = spec.promptAliases.slice(0, 8).join(', ');
      return `- ${spec.type} (${spec.title}${spec.tier === 'pro' ? ', Pro' : ''}): ${spec.aiPurpose} Fields: ${spec.aiFields.join(', ')} Keywords: ${keywords}`;
    });
}

export function getRegistryKeywordLines(tier: 'free' | 'pro'): string[] {
  return getAllSmartModuleSpecs()
    .filter(spec => tier === 'pro' || spec.tier === 'free')
    .map(spec => {
      const scope = spec.isSmartComposable ? 'supported' : 'library-only';
      return `- ${spec.type} (${spec.title}${spec.tier === 'pro' ? ', Pro' : ''}, ${scope}): ${spec.promptAliases.slice(0, 10).join(', ')}`;
    });
}

export function getRegistryAiInstructionLines(tier: 'free' | 'pro'): string[] {
  const lines: string[] = [
    'If the user explicitly names a module type (bar, gauge, image, qr code, calendar, sports, etc.), use exactly that module type even when a generic info row would also work.',
  ];

  for (const spec of getAllSmartModuleSpecs().filter(entry => tier === 'pro' || entry.tier === 'free')) {
    const scope = spec.isSmartComposable ? 'composable' : 'library-only (do not output unless explicitly requested and supported)';
    const example = spec.aiExample ? ` Example: ${JSON.stringify(spec.aiExample)}` : '';
    lines.push(
      `- ${spec.type} (${spec.title}, ${scope}): ${spec.aiPurpose}. Domains: ${spec.entityDomains.join(', ')}. Fields: ${spec.aiFields.join(', ')}.${example}`
    );
  }

  return lines;
}

export function buildModuleFromRegistrySpec(
  type: string,
  ctx: SmartBuildContext
): ReturnType<NonNullable<SmartModuleSpec['defaultBuilder']>> {
  const spec = getSmartModuleSpec(type);
  if (!spec?.defaultBuilder) return null;
  return spec.defaultBuilder(ctx);
}

export { SMART_LIBRARY_ONLY_TYPES, SMART_CONTAINER_TYPE_SET };
