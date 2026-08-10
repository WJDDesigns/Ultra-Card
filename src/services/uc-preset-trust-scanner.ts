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

export interface PresetRiskFindings {
  /** Services the preset can invoke, e.g. `lock.unlock`. */
  serviceCalls: string[];
  /** Third-party hosts contacted on render, which reveals that you viewed this card. */
  remoteHosts: string[];
  /** Other cards this preset embeds and hands `hass` to. */
  embeddedCards: string[];
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
  const serviceCalls = new Set<string>();
  const remoteHosts = new Set<string>();
  const embeddedCards = new Set<string>();

  let nodes = 0;
  const seen = new WeakSet<object>();

  const visitString = (value: string): void => {
    // Only absolute http(s) URLs reach a third party. Relative paths and
    // /local/... asset paths are served by the user's own HA.
    if (!/^https?:\/\//i.test(value)) return;
    const host = hostOf(value);
    if (host && !isBenignHost(host)) remoteHosts.add(host);
  };

  const visit = (node: unknown, depth: number): void => {
    if (node === null || node === undefined) return;
    if (nodes++ > MAX_NODES || depth > MAX_DEPTH) return;

    if (typeof node === 'string') {
      visitString(node);
      return;
    }
    if (typeof node !== 'object') return;

    // Presets arrive as parsed JSON so cycles are not expected, but a caller
    // could hand us a live config object.
    if (seen.has(node as object)) return;
    seen.add(node as object);

    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }

    const obj = node as Record<string, unknown>;

    if (typeof obj.action === 'string' && SERVICE_ACTIONS.has(obj.action)) {
      const service =
        (typeof obj.perform_action === 'string' && obj.perform_action) ||
        (typeof obj.service === 'string' && obj.service) ||
        '';
      serviceCalls.add(service || 'an unspecified service');
    }

    if (obj.type === 'external_card' || obj.type === 'native_card') {
      const cardType =
        (typeof obj.card_type === 'string' && obj.card_type) ||
        (typeof (obj.card_config as Record<string, unknown> | undefined)?.type === 'string' &&
          String((obj.card_config as Record<string, unknown>).type)) ||
        'an unnamed card';
      embeddedCards.add(cardType);
    }

    for (const value of Object.values(obj)) visit(value, depth + 1);
  };

  visit(root, 0);

  const sorted = (s: Set<string>): string[] => Array.from(s).sort();
  const findings: PresetRiskFindings = {
    serviceCalls: sorted(serviceCalls),
    remoteHosts: sorted(remoteHosts),
    embeddedCards: sorted(embeddedCards),
    hasAny: false,
  };
  findings.hasAny =
    findings.serviceCalls.length > 0 ||
    findings.remoteHosts.length > 0 ||
    findings.embeddedCards.length > 0;
  return findings;
}
