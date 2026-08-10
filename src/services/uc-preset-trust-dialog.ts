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
    const overlay = document.createElement('div');
    overlay.className = 'uc-preset-trust-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
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
      <div class="uc-preset-trust-backdrop"></div>
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
      .uc-preset-trust-overlay {
        position: fixed;
        inset: 0;
        /* Match the action confirmation dialog: Ultra popup portals use the max
           32-bit z-index, so this must tie and win on DOM order. */
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
      document.removeEventListener('keydown', handleKeydown, { capture: true });
      if (style.parentNode) style.remove();
      if (overlay.parentNode) overlay.remove();
      resolve(confirmed);
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

    overlay
      .querySelector('.uc-preset-trust-backdrop')
      ?.addEventListener('click', () => finalize(false));

    document.body.appendChild(overlay);
    document.body.appendChild(style);
    document.addEventListener('keydown', handleKeydown, { capture: true });

    // Focus Cancel rather than the primary action: a stray Enter on a security
    // prompt should decline, not accept.
    requestAnimationFrame(() => cancelButton.focus());
  });
}
