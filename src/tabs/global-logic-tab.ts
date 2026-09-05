import { html, TemplateResult } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { CardModule, CardColumn, CardRow } from '../types';

export type GlobalLogicTarget = 'module' | 'row' | 'column';

export interface GlobalLogicArgs {
  target: CardModule | CardRow | CardColumn;
  hass: HomeAssistant;
  update: (updates: Partial<CardModule | CardRow | CardColumn>) => void;
  logicTarget: GlobalLogicTarget;
}

/**
 * Logic tab entry point used by modules' `renderOtherTab` and by the layout
 * tab for rows and columns.
 *
 * `render()` only mounts `<ultra-global-logic-tab>`; the element and the form
 * implementation live in `src/editor/global-logic-tab-element.ts` (editor
 * chunk), so this file stays tiny and nothing of the tab ships in
 * ultra-card.js. `args` is a new object each call so the element re-renders
 * with its parent, exactly as the inlined template used to.
 */
export class GlobalLogicTab {
  static render<M extends CardModule | CardRow | CardColumn>(
    module: M,
    hass: HomeAssistant,
    updateModule: (updates: Partial<M>) => void,
    logicTarget: GlobalLogicTarget = 'module'
  ): TemplateResult {
    const args: GlobalLogicArgs = {
      target: module,
      hass,
      update: updateModule as GlobalLogicArgs['update'],
      logicTarget,
    };
    return html`<ultra-global-logic-tab .args=${args}></ultra-global-logic-tab>`;
  }
}
