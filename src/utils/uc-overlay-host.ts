import { Z_INDEX } from './uc-z-index';

/**
 * Resolves the safest overlay host/layer for floating UI (dropdowns, tooltips, popovers).
 * When an overlay is triggered inside an Ultra popup portal, it should render inside that
 * same portal so it is not trapped behind the popup's top-level stacking context.
 */
export function resolveOverlayLayer(
  anchor?: Element | null,
  fallbackZIndex: number = Z_INDEX.DROPDOWN_MENU
): {
  host: HTMLElement;
  zIndex: number;
} {
  const popupPortal = anchor?.closest?.('.ultra-popup-portal');
  if (popupPortal instanceof HTMLElement) {
    return {
      host: popupPortal,
      zIndex: Z_INDEX.GRAPH_TOOLTIP,
    };
  }

  return {
    host: document.body,
    zIndex: fallbackZIndex,
  };
}
