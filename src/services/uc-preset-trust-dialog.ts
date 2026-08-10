import type { PresetRiskFindings } from './uc-preset-trust-scanner';

/**
 * Disclosure prompt shown before a downloaded preset is applied.
 *
 * Nothing here is stripped from the preset — legitimate presets genuinely need
 * service calls, embedded cards and remote images. The point is that applying a
 * preset looks cosmetic, so the capabilities it brings with it are stated before
 * the content is live rather than discovered later.
 */

/**
 * Every value rendered below comes from downloaded preset content, so it is
 * escaped before it reaches innerHTML. A disclosure dialog that could itself be
 * injected would be worse than no dialog at all.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSection(title: string, note: string, items: string[]): string {
  if (!items.length) return '';
  const listItems = items.map(item => `<li><code>${escapeHtml(item)}</code></li>`).join('');
  return `
    <div class="uc-preset-trust-section">
      <div class="uc-preset-trust-section-title">${escapeHtml(title)}</div>
      <div class="uc-preset-trust-section-note">${escapeHtml(note)}</div>
      <ul class="uc-preset-trust-list">${listItems}</ul>
    </div>
  `;
}

export function confirmUntrustedPreset(
  presetName: string,
  findings: PresetRiskFindings
): Promise<boolean> {
  if (!findings.hasAny) return Promise.resolve(true);

  return new Promise<boolean>(resolve => {
    // A <dialog> opened with showModal() enters the browser's top layer. This
    // prompt appears while the Ultra Card editor is itself inside Home
    // Assistant's modal card-edit dialog, and no z-index on a document.body
    // child can paint above a top-layer element or receive its clicks — the
    // prompt would render behind the editor and the preset would silently never
    // arrive. Top layer stacks by promotion order, so opening ours last puts it
    // above HA's.
    const supportsModal = typeof HTMLDialogElement !== 'undefined';
    const overlay = document.createElement(supportsModal ? 'dialog' : 'div');
    overlay.className = supportsModal
      ? 'uc-preset-trust-dialog'
      : 'uc-preset-trust-dialog uc-preset-trust-fallback';
    if (!supportsModal) {
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
    }
    overlay.setAttribute('aria-label', 'Review preset before adding');

    const sections = [
      renderSection(
        'Calls Home Assistant services',
        'Buttons in this preset can run these when tapped:',
        findings.serviceCalls
      ),
      renderSection(
        'Loads content from other servers',
        'These hosts will be contacted whenever the card is displayed:',
        findings.remoteHosts
      ),
      renderSection(
        'Embeds other cards',
        'These cards are created inside the preset and receive your Home Assistant data:',
        findings.embeddedCards
      ),
    ].join('');

    overlay.innerHTML = `
      ${supportsModal ? '' : '<div class="uc-preset-trust-backdrop"></div>'}
      <div class="uc-preset-trust-panel">
        <h2 class="uc-preset-trust-title">Review “${escapeHtml(presetName)}” before adding</h2>
        <p class="uc-preset-trust-message">
          This preset was downloaded, so it can do more than change how your card looks.
          Here is what it brings with it.
        </p>
        <div class="uc-preset-trust-body">${sections}</div>
        <p class="uc-preset-trust-footnote">
          Nothing has been added to your dashboard yet.
        </p>
        <div class="uc-preset-trust-actions"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      dialog.uc-preset-trust-dialog {
        /* Reset the UA dialog box so the panel below controls all appearance. */
        border: none;
        padding: 0;
        margin: auto;
        background: transparent;
        max-width: none;
        max-height: none;
        overflow: visible;
        color: var(--primary-text-color);
      }
      dialog.uc-preset-trust-dialog::backdrop {
        background: rgba(0, 0, 0, 0.56);
      }
      /* Fallback for engines without <dialog>: positioned overlay, which cannot
         escape the top layer but is better than showing nothing. */
      .uc-preset-trust-fallback {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: grid;
        place-items: center;
      }
      .uc-preset-trust-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.56);
      }
      .uc-preset-trust-panel {
        position: relative;
        width: min(92vw, 560px);
        max-height: 84vh;
        overflow-y: auto;
        border-radius: 14px;
        background: var(--card-background-color, #1f1f1f);
        color: var(--primary-text-color);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.42);
        padding: 18px 18px 14px;
      }
      .uc-preset-trust-title {
        margin: 0 0 10px;
        font-size: 20px;
        line-height: 1.25;
      }
      .uc-preset-trust-message {
        margin: 0 0 14px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }
      .uc-preset-trust-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
      }
      .uc-preset-trust-section-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      .uc-preset-trust-section-note {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }
      .uc-preset-trust-list {
        margin: 0;
        padding-left: 18px;
        font-size: 13px;
        line-height: 1.7;
      }
      .uc-preset-trust-list code {
        font-family: var(--code-font-family, monospace);
        word-break: break-all;
      }
      .uc-preset-trust-footnote {
        margin: 12px 0 0;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .uc-preset-trust-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 14px;
      }
      .uc-preset-trust-btn {
        appearance: none;
        border: none;
        border-radius: 8px;
        padding: 9px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-preset-trust-btn.secondary {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }
      .uc-preset-trust-btn.primary {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }
      .uc-preset-trust-btn:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }
    `;

    let resolved = false;
    const finalize = (confirmed: boolean): void => {
      if (resolved) return;
      resolved = true;
      // Teardown must never be able to strand the caller: this promise gates
      // whether the preset applies at all, so the answer is delivered even if
      // dismissing or removing the dialog throws.
      try {
        document.removeEventListener('keydown', handleKeydown, { capture: true });
        if (supportsModal) {
          const asDialog = overlay as HTMLDialogElement;
          if (asDialog.open) asDialog.close();
        }
      } catch (error) {
        console.warn('[UltraCard] Preset review dialog cleanup failed:', error);
      } finally {
        if (style.parentNode) style.remove();
        if (overlay.parentNode) overlay.remove();
        resolve(confirmed);
      }
    };

    // Capture phase so Escape does not also close an Ultra popup underneath,
    // matching uc-action-confirmation-service.
    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finalize(false);
        return;
      }
      if (event.key === 'Tab') {
        const buttons = Array.from(overlay.querySelectorAll<HTMLElement>('.uc-preset-trust-btn'));
        if (!buttons.length) return;
        event.preventDefault();
        event.stopPropagation();
        const index = buttons.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey
          ? index <= 0
            ? buttons.length - 1
            : index - 1
          : index === -1 || index === buttons.length - 1
            ? 0
            : index + 1;
        buttons[next]?.focus();
      }
    };

    const actionsRow = overlay.querySelector('.uc-preset-trust-actions') as HTMLDivElement;

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'uc-preset-trust-btn secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => finalize(false));
    actionsRow.appendChild(cancelButton);

    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'uc-preset-trust-btn primary';
    confirmButton.textContent = 'Add preset';
    confirmButton.addEventListener('click', () => finalize(true));
    actionsRow.appendChild(confirmButton);

    if (supportsModal) {
      // With a <dialog> the backdrop is ::backdrop and is not a child, so a click
      // landing on the dialog element itself is a click outside the panel.
      overlay.addEventListener('click', event => {
        if (event.target === overlay) finalize(false);
      });
      // Escape and any other native dismissal must still settle the promise,
      // otherwise the awaiting caller would hang and the preset would neither
      // apply nor report anything.
      overlay.addEventListener('cancel', event => {
        event.preventDefault();
        finalize(false);
      });
      overlay.addEventListener('close', () => finalize(false));
    } else {
      overlay
        .querySelector('.uc-preset-trust-backdrop')
        ?.addEventListener('click', () => finalize(false));
    }

    document.body.appendChild(overlay);
    document.body.appendChild(style);

    if (supportsModal) {
      try {
        (overlay as HTMLDialogElement).showModal();
      } catch (error) {
        // Never leave the caller awaiting a dialog the user cannot see. Degrade to
        // a plain positioned overlay: it cannot beat the top layer, but a visible
        // prompt in the wrong stacking order is recoverable, whereas an invisible
        // one loses the user's preset with no explanation.
        console.warn('[UltraCard] Preset review dialog could not open modally:', error);
        overlay.setAttribute('open', '');
        overlay.classList.add('uc-preset-trust-fallback');
      }
    }

    document.addEventListener('keydown', handleKeydown, { capture: true });

    // Focus Cancel rather than the primary action: a stray Enter on a security
    // prompt should decline, not accept.
    requestAnimationFrame(() => cancelButton.focus());
  });
}
