import { noChange } from 'lit';
import { AsyncDirective } from 'lit/async-directive.js';
import { directive, PartType, type ElementPart, type PartInfo } from 'lit/directive.js';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), ha-textfield, ha-select, ha-switch, ha-icon-button';

/** The focused element, looking through open shadow roots. */
function deepActiveElement(): HTMLElement | null {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el instanceof HTMLElement ? el : null;
}

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => !el.hasAttribute('hidden') && el.getClientRects().length > 0
  );
}

/**
 * Makes a hand-rolled overlay behave like a dialog: role="dialog" and
 * aria-modal, Escape closes it, Tab stays inside it, focus moves in on open and
 * goes back to where it was on close.
 *
 *   <div class="dialog" ${ucDialog(() => this._close())}>…</div>
 */
class UcDialogDirective extends AsyncDirective {
  private _el?: HTMLElement;
  private _onClose?: () => void;
  private _returnFocus: HTMLElement | null = null;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('ucDialog() must be used on an element');
    }
  }

  render(_onClose: () => void): unknown {
    return noChange;
  }

  override update(part: ElementPart, [onClose]: [() => void]): unknown {
    this._onClose = onClose;
    const el = part.element as HTMLElement;
    if (el !== this._el) {
      this._detach();
      this._el = el;
      this._attach();
    }
    return noChange;
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (!this._el) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      this._onClose?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables(this._el);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = deepActiveElement();
    const inside = active ? this._el.contains(active) || active === this._el : false;
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  };

  private _attach(): void {
    const el = this._el;
    if (!el) return;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.addEventListener('keydown', this._onKeyDown);
    this._returnFocus = deepActiveElement();
    // After first paint, so the dialog's own content exists.
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const active = deepActiveElement();
      if (active && el.contains(active)) return;
      (focusables(el)[0] ?? el).focus({ preventScroll: true });
    });
  }

  private _detach(): void {
    this._el?.removeEventListener('keydown', this._onKeyDown);
  }

  protected override disconnected(): void {
    this._detach();
    const target = this._returnFocus;
    this._returnFocus = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }

  protected override reconnected(): void {
    this._attach();
  }
}

export const ucDialog = directive(UcDialogDirective);
