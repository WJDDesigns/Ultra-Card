import { describe, it, expect } from 'vitest';
import { describeThemeRisks, scanThemeCss, scanThemeForRisks } from './uc-theme-trust-scanner';
import type { UcThemeDefinition } from '../themes/uc-theme-types';

const base = (extra: Partial<UcThemeDefinition> = {}): UcThemeDefinition => ({
  id: 'wp-test',
  name: 'Test',
  version: 1,
  tokens: { surface: 'glass', radius: 16 },
  ...extra,
});

describe('scanThemeForRisks', () => {
  it('reports nothing for a token-only theme', () => {
    const findings = scanThemeForRisks(base());
    expect(findings.hasAny).toBe(false);
    expect(findings.css).toBeNull();
    expect(findings.paletteOverrides).toEqual([]);
    expect(findings.remoteHosts).toEqual([]);
  });

  it('counts custom CSS rules and lines', () => {
    const css = `.card-container { padding: 4px; }\n.button-module { border: 0; }`;
    const findings = scanThemeForRisks(base({ css }));
    expect(findings.hasAny).toBe(true);
    expect(findings.css).toEqual({ lines: 2, rules: 2, findings: [] });
  });

  it('flags CSS that hides or covers content, naming the selectors', () => {
    const css = `
      /* a comment { with braces } */
      .card-container .button-module { display: none; }
      .card-container .text-module { opacity: 0; pointer-events: none; }
      .badge { position: fixed; z-index: 99999; }
      .badge::after { content: "free money"; }
    `;
    const found = scanThemeCss(css)!;
    expect(found.rules).toBe(4);
    const reasons = found.findings.map(f => f.reason);
    expect(reasons).toEqual(
      expect.arrayContaining([
        'hides elements (display: none)',
        'makes elements invisible (opacity: 0)',
        'disables clicks (pointer-events: none)',
        'positions content over the page (position: fixed/sticky)',
        'very high z-index (may cover dialogs)',
        'injects text (content: "...")',
      ])
    );
    const hide = found.findings.find(f => f.reason.startsWith('hides'))!;
    expect(hide.selectors).toEqual(['.card-container .button-module']);
  });

  it('flags selectors that reach the host or HA chrome', () => {
    const found = scanThemeCss(`:host { color: red; } body .x { color: blue; } .hostile-not-host { x: y }`)!;
    const outside = found.findings.find(f => f.reason.includes('card host'))!;
    expect(outside.selectors).toEqual([':host', 'body .x']);
  });

  it('does not treat a normal opacity as invisible', () => {
    const found = scanThemeCss(`.a { opacity: 0.6; } .b { opacity: 0.05 }`)!;
    expect(found.findings).toEqual([]);
  });

  it('lists palette overrides and third-party preview hosts', () => {
    const findings = scanThemeForRisks(
      base({
        tokens: { surface: 'flat', radius: 8, palette: { primary: '#f00', card_bg: '#000' } },
        preview: 'https://cdn.example.com/theme.png',
      })
    );
    expect(findings.paletteOverrides).toEqual(['card_bg', 'primary']);
    expect(findings.remoteHosts).toEqual(['cdn.example.com']);
    expect(findings.hasAny).toBe(true);
  });

  it('treats ultracard.io previews as benign', () => {
    const findings = scanThemeForRisks(base({ preview: 'https://ultracard.io/wp-content/x.png' }));
    expect(findings.remoteHosts).toEqual([]);
    expect(findings.hasAny).toBe(false);
  });

  it('describes findings as readable lines', () => {
    const lines = describeThemeRisks(
      scanThemeForRisks(
        base({
          css: '.a { display: none; }',
          tokens: { surface: 'flat', radius: 8, palette: { text: '#fff' } },
        })
      )
    );
    expect(lines[0]).toBe('Custom CSS: 1 rule (1 lines).');
    expect(lines[1]).toContain('hides elements');
    expect(lines[2]).toContain('text');
  });
});
