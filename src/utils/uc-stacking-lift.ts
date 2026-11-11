/**
 * Lift an element's stacking contexts so a floating panel inside it paints
 * above the cards that come after it on the dashboard.
 *
 * A `z-index` only competes inside its nearest stacking context. The Ultra
 * Card host uses `container-type: inline-size`, which (like isolation,
 * transforms, filters and containment) creates one, so an overlay panel with
 * `z-index: 1000` can never rise above the next card on the page: that card
 * paints later and covers the panel, and anything see-through in it lets the
 * panel's text show through as if the panel had no background.
 *
 * `liftStackingContexts` walks up from the element (crossing shadow roots)
 * and gives every stacking-context ancestor a small z-index, stopping at the
 * dashboard view so HA's own header and dialogs stay on top. The returned
 * function puts every touched inline style back.
 */

/** High enough to beat neighbouring cards, below HA's toolbar (z-index 4). */
export const UC_LIFT_Z_INDEX = 3;

/** Never touch these or anything above them. */
const BOUNDARY_TAGS = new Set([
  'HUI-VIEW',
  'HUI-MASONRY-VIEW',
  'HUI-SECTIONS-VIEW',
  'HUI-PANEL-VIEW',
  'HUI-SIDEBAR-VIEW',
  'HUI-ROOT',
  'HA-DIALOG',
  'HA-MD-DIALOG',
  'HA-WA-DIALOG',
  'DIALOG',
  'BODY',
  'HTML',
]);

const MAX_DEPTH = 40;

interface LiftRecord {
  count: number;
  prevZIndex: string;
  prevPosition: string;
}

const lifted = new WeakMap<HTMLElement, LiftRecord>();

function composedParent(el: Element): Element | null {
  if (el.parentElement) return el.parentElement;
  const root = el.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

function makesStackingContext(cs: CSSStyleDeclaration, parentDisplay: string): boolean {
  const pos = cs.position;
  const isFlexOrGridItem = /flex|grid/.test(parentDisplay);
  if (cs.zIndex !== 'auto' && (pos !== 'static' || isFlexOrGridItem)) return true;
  if (pos === 'fixed' || pos === 'sticky') return true;
  if (parseFloat(cs.opacity) < 1) return true;
  if (cs.transform && cs.transform !== 'none') return true;
  if (cs.filter && cs.filter !== 'none') return true;
  const extra = cs as CSSStyleDeclaration & { backdropFilter?: string; containerType?: string };
  if (extra.backdropFilter && extra.backdropFilter !== 'none') return true;
  if (cs.perspective && cs.perspective !== 'none') return true;
  if (cs.isolation === 'isolate') return true;
  if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') return true;
  if (cs.clipPath && cs.clipPath !== 'none') return true;
  const contain = cs.contain || '';
  if (/layout|paint|strict|content/.test(contain)) return true;
  const containerType = extra.containerType;
  if (containerType && containerType !== 'normal') return true;
  const willChange = cs.willChange || '';
  if (/transform|opacity|filter|z-index|isolation/.test(willChange)) return true;
  return false;
}

export function liftStackingContexts(start: Element, zIndex = UC_LIFT_Z_INDEX): () => void {
  const touched: HTMLElement[] = [];
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return () => undefined;
  }

  let el: Element | null = composedParent(start);
  for (let depth = 0; el && depth < MAX_DEPTH; depth++) {
    if (BOUNDARY_TAGS.has(el.tagName)) break;
    const parent = composedParent(el);
    if (el instanceof HTMLElement) {
      const existing = lifted.get(el);
      if (existing) {
        existing.count++;
        touched.push(el);
      } else {
        const cs = getComputedStyle(el);
        const parentDisplay = parent ? getComputedStyle(parent).display : '';
        if (cs.display !== 'contents' && makesStackingContext(cs, parentDisplay)) {
          const currentZ = parseInt(cs.zIndex, 10);
          if (cs.zIndex === 'auto' || Number.isNaN(currentZ) || currentZ < zIndex) {
            lifted.set(el, {
              count: 1,
              prevZIndex: el.style.zIndex,
              prevPosition: el.style.position,
            });
            const isFlexOrGridItem = /flex|grid/.test(parentDisplay);
            if (cs.position === 'static' && !isFlexOrGridItem) {
              el.style.position = 'relative';
            }
            el.style.zIndex = String(zIndex);
            touched.push(el);
          }
        }
      }
    }
    el = parent;
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const node of touched) {
      const rec = lifted.get(node);
      if (!rec) continue;
      rec.count--;
      if (rec.count <= 0) {
        node.style.zIndex = rec.prevZIndex;
        node.style.position = rec.prevPosition;
        lifted.delete(node);
      }
    }
  };
}
