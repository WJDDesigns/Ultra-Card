import type { CardModule } from '../types';
import { getModuleRegistry } from '../modules/module-registry';

/** Concatenate getStyles() for every module type used inside a portal (Popup,
 *  Drawer) so class-based child styles still apply in the light-DOM portal. */
export function collectPortalChildStyles(modules: CardModule[] | undefined): string {
  const registry = getModuleRegistry();
  const seen = new Set<string>();
  const collect = (list: CardModule[] | undefined): void => {
    (list || []).forEach(m => {
      seen.add(m.type);
      const nested = (m as { modules?: CardModule[] }).modules;
      if (Array.isArray(nested)) collect(nested);
    });
  };
  collect(modules);
  let css = '';
  seen.forEach(type => {
    const handler = registry.getModule(type);
    if (handler?.getStyles) css += handler.getStyles();
  });
  return css;
}
