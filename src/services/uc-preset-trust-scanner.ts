/**
 * What a downloaded preset can do to you once applied.
 *
 * Applying a preset is a one-click action users treat as cosmetic, but preset
 * content can call services, embed arbitrary cards and pull images from remote
 * hosts. None of those are stripped: legitimate presets rely on all three (a
 * vehicle-control preset calling services is the point of it). Instead they are
 * surfaced so the user can decide before the content is live on their dashboard.
 *
 * The traversal is deliberately shape-agnostic. Ultra Card has many container
 * modules that nest children under different keys (columns, modules, tabs,
 * panels, panes, sections, popups), and a shape-aware walk would silently miss
 * whichever nesting a malicious preset chose. Walking every object and array
 * cannot be evaded that way.
 */

export interface PresetRiskItem {
  /** The service, host or card type found. */
  value: string;
  /**
   * Which modules it belongs to, innermost first. Naming the module makes the
   * finding actionable: "a host is contacted" is far less useful than knowing it
   * is the background image on a specific module.
   */
  sources: string[];
}

export interface PresetRiskFindings {
  /** Services the preset can invoke, e.g. `lock.unlock`. */
  serviceCalls: PresetRiskItem[];
  /** Third-party hosts contacted on render, which reveals that you viewed this card. */
  remoteHosts: PresetRiskItem[];
  /** Other cards this preset embeds and hands `hass` to. */
  embeddedCards: PresetRiskItem[];
  hasAny: boolean;
}

/** Hosts that are part of normal operation rather than third-party contact. */
const BENIGN_HOST_SUFFIXES = ['ultracard.io', 'home-assistant.io', 'brands.home-assistant.io'];

// A malformed or hostile preset should not be able to hang the editor by nesting
// itself thousands of levels deep, or by carrying a huge object graph.
const MAX_DEPTH = 40;
const MAX_NODES = 200_000;

const SERVICE_ACTIONS = new Set(['perform-action', 'call-service']);

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}

function isBenignHost(host: string): boolean {
  const lower = host.toLowerCase();
  return BENIGN_HOST_SUFFIXES.some(
    suffix => lower === suffix || lower.endsWith(`.${suffix}`)
  );
}

export function scanPresetForRisks(root: unknown): PresetRiskFindings {
  const serviceCalls = new Map<string, Set<string>>();
  const remoteHosts = new Map<string, Set<string>>();
  const embeddedCards = new Map<string, Set<string>>();

  let nodes = 0;
  const seen = new WeakSet<object>();

  const record = (into: Map<string, Set<string>>, value: string, owner: string | null): void => {
    const sources = into.get(value) ?? new Set<string>();
    if (owner) sources.add(owner);
    into.set(value, sources);
  };

  const visit = (node: unknown, depth: number, owner: string | null): void => {
    if (node === null || node === undefined) return;
    if (nodes++ > MAX_NODES || depth > MAX_DEPTH) return;

    if (typeof node === 'string') {
      // Only absolute http(s) URLs reach a third party. Relative paths and
      // /local/... asset paths are served by the user's own HA.
      if (!/^https?:\/\//i.test(node)) return;
      const host = hostOf(node);
      if (host && !isBenignHost(host)) record(remoteHosts, host, owner);
      return;
    }
    if (typeof node !== 'object') return;

    // Presets arrive as parsed JSON so cycles are not expected, but a caller
    // could hand us a live config object.
    if (seen.has(node as object)) return;
    seen.add(node as object);

    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1, owner);
      return;
    }

    const obj = node as Record<string, unknown>;

    // Attribute findings to the innermost enclosing module. Action objects also
    // carry a `type` in some shapes, so only treat a node as a module when it
    // is not one of those.
    const isActionNode = typeof obj.action === 'string';
    const nextOwner =
      !isActionNode && typeof obj.type === 'string' && obj.type ? obj.type : owner;

    if (isActionNode && SERVICE_ACTIONS.has(obj.action as string)) {
      const service =
        (typeof obj.perform_action === 'string' && obj.perform_action) ||
        (typeof obj.service === 'string' && obj.service) ||
        '';
      record(serviceCalls, service || 'an unspecified service', owner);
    }

    if (obj.type === 'external_card' || obj.type === 'native_card') {
      const cardType =
        (typeof obj.card_type === 'string' && obj.card_type) ||
        (typeof (obj.card_config as Record<string, unknown> | undefined)?.type === 'string' &&
          String((obj.card_config as Record<string, unknown>).type)) ||
        'an unnamed card';
      record(embeddedCards, cardType, String(obj.type));
    }

    for (const value of Object.values(obj)) visit(value, depth + 1, nextOwner);
  };

  visit(root, 0, null);

  const toItems = (from: Map<string, Set<string>>): PresetRiskItem[] =>
    Array.from(from, ([value, sources]) => ({
      value,
      sources: Array.from(sources).sort(),
    })).sort((a, b) => a.value.localeCompare(b.value));

  const findings: PresetRiskFindings = {
    serviceCalls: toItems(serviceCalls),
    remoteHosts: toItems(remoteHosts),
    embeddedCards: toItems(embeddedCards),
    hasAny: false,
  };
  findings.hasAny =
    findings.serviceCalls.length > 0 ||
    findings.remoteHosts.length > 0 ||
    findings.embeddedCards.length > 0;
  return findings;
}
