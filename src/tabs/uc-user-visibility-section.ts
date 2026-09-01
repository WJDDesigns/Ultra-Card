import { html, TemplateResult, nothing } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { UserVisibility } from '../types';
import { localize } from '../localize/localize';
import { ucHaUsersService } from '../services/uc-ha-users-service';
import { logicService } from '../services/logic-service';
import '../components/ultra-segmented';

export type UserVisibilityModeChoice = 'everyone' | 'show' | 'hide';

function modeFromValue(value: UserVisibility | undefined | null): UserVisibilityModeChoice {
  if (!value?.users || value.users.length === 0) return 'everyone';
  return value.mode === 'hide' ? 'hide' : 'show';
}

function normalizeUpdate(
  mode: UserVisibilityModeChoice,
  users: string[]
): UserVisibility | undefined {
  if (mode === 'everyone' || users.length === 0) {
    return undefined;
  }
  return {
    mode: mode === 'hide' ? 'hide' : 'show',
    users: [...users],
  };
}

/**
 * Shared “Visible to users” section — same visual language as Hide on Devices.
 * Used by Logic tab (modules/rows/columns), card settings, and per-icon editors.
 */
export function renderUserVisibilitySection(
  value: UserVisibility | undefined | null,
  hass: HomeAssistant | undefined,
  onChange: (next: UserVisibility | undefined) => void
): TemplateResult {
  const lang = hass?.locale?.language || 'en';
  const mode = modeFromValue(value);
  const selectedIds = new Set(value?.users || []);
  const users = ucHaUsersService.getUsers(hass);
  const fallbackOnly = ucHaUsersService.isFallbackOnly();
  const currentId = (hass as any)?.user?.id as string | undefined;
  if (hass) {
    logicService.setHass(hass);
  }
  const wouldHideSelf =
    mode !== 'everyone' &&
    !!hass &&
    !logicService.evaluateUserVisibility(value || undefined);

  const setMode = (nextMode: UserVisibilityModeChoice) => {
    if (nextMode === 'everyone') {
      onChange(undefined);
      return;
    }
    const existing = value?.users?.length ? [...value.users] : currentId ? [currentId] : [];
    onChange(normalizeUpdate(nextMode, existing));
  };

  const toggleUser = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(normalizeUpdate(mode === 'everyone' ? 'show' : mode, [...next]));
  };

  const addManualId = (raw: string) => {
    const id = raw.trim();
    if (!id) return;
    const next = new Set(selectedIds);
    next.add(id);
    onChange(normalizeUpdate(mode === 'everyone' ? 'show' : mode, [...next]));
  };

  return html`
    <div
      class="settings-section uc-user-visibility-section"
      style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 3px solid var(--primary-color);"
    >
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <ha-icon icon="mdi:account-eye" style="color: var(--primary-color);"></ha-icon>
        <span style="font-size: 16px; font-weight: 700; color: var(--primary-text-color);">
          ${localize('editor.logic.user_visibility.title', lang, 'Visible to Users')}
        </span>
      </div>
      <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
        ${localize(
          'editor.logic.user_visibility.desc',
          lang,
          'Show or hide this element for specific Home Assistant users. Same idea as Lovelace card Visibility → User.'
        )}
      </div>

      <div class="field-container uc-ultra-field-wrap" style="margin-bottom: 12px;">
        <ultra-segmented
          .label=${localize('editor.logic.user_visibility.mode', lang, 'Who can see this')}
          .description=${''}
          .value=${mode}
          .options=${[
            {
              value: 'everyone',
              label: localize('editor.logic.user_visibility.everyone', lang, 'Everyone'),
              icon: 'mdi:account-group',
            },
            {
              value: 'show',
              label: localize('editor.logic.user_visibility.show_only', lang, 'Show only for'),
              icon: 'mdi:account-check',
            },
            {
              value: 'hide',
              label: localize('editor.logic.user_visibility.hide_for', lang, 'Hide for'),
              icon: 'mdi:account-off',
            },
          ]}
          .columns=${3}
          @value-changed=${(e: CustomEvent<{ value: string }>) => {
            setMode((e.detail?.value as UserVisibilityModeChoice) || 'everyone');
          }}
        ></ultra-segmented>
      </div>

      ${mode !== 'everyone'
        ? html`
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${users.length === 0
                ? html`
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${localize(
                        'editor.logic.user_visibility.no_users',
                        lang,
                        'No users available yet. Enter a user ID below.'
                      )}
                    </div>
                  `
                : users.map(
                    u => html`
                      <label
                        style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--card-background-color); border-radius: 6px; cursor: pointer; border: 1px solid ${selectedIds.has(
                          u.id
                        )
                          ? 'var(--primary-color)'
                          : 'var(--divider-color)'};"
                      >
                        <ha-checkbox
                          .checked=${selectedIds.has(u.id)}
                          @change=${() => toggleUser(u.id)}
                        ></ha-checkbox>
                        <ha-icon
                          icon="mdi:account"
                          style="color: ${selectedIds.has(u.id)
                            ? 'var(--primary-color)'
                            : 'var(--secondary-text-color)'}; --mdc-icon-size: 20px;"
                        ></ha-icon>
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-weight: 500; font-size: 13px;">
                            ${u.name}
                            ${u.id === currentId
                              ? html`<span
                                  style="margin-left: 6px; font-size: 11px; color: var(--primary-color); font-weight: 600;"
                                  >${localize(
                                    'editor.logic.user_visibility.you',
                                    lang,
                                    '(you)'
                                  )}</span
                                >`
                              : nothing}
                          </div>
                          <div
                            style="font-size: 11px; color: var(--secondary-text-color); overflow: hidden; text-overflow: ellipsis;"
                          >
                            ${u.id}
                          </div>
                        </div>
                      </label>
                    `
                  )}

              ${fallbackOnly
                ? html`
                    <div style="margin-top: 4px;" class="uc-user-vis-manual-wrap">
                      <div
                        style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 6px;"
                      >
                        ${localize(
                          'editor.logic.user_visibility.manual_id_desc',
                          lang,
                          'Could not load the full user list (admin permission may be required). Add other users by ID:'
                        )}
                      </div>
                      <div style="display: flex; gap: 8px;">
                        <ha-textfield
                          class="uc-user-vis-manual-input"
                          style="flex: 1;"
                          .label=${localize(
                            'editor.logic.user_visibility.manual_id',
                            lang,
                            'User ID'
                          )}
                          .placeholder=${'581fca7f…'}
                          @keydown=${(e: KeyboardEvent) => {
                            if (e.key === 'Enter') {
                              const input = e.target as any;
                              addManualId(input.value || '');
                              input.value = '';
                            }
                          }}
                        ></ha-textfield>
                        <button
                          type="button"
                          style="padding: 0 14px; border: 1px solid var(--primary-color); background: none; color: var(--primary-color); border-radius: 6px; cursor: pointer;"
                          @click=${(e: Event) => {
                            const wrap = (e.currentTarget as HTMLElement).closest(
                              '.uc-user-vis-manual-wrap'
                            );
                            const el = wrap?.querySelector(
                              '.uc-user-vis-manual-input'
                            ) as any;
                            addManualId(el?.value || '');
                            if (el) el.value = '';
                          }}
                        >
                          ${localize('editor.logic.user_visibility.add', lang, 'Add')}
                        </button>
                      </div>
                    </div>
                  `
                : nothing}

              ${wouldHideSelf
                ? html`
                    <div
                      style="margin-top: 8px; padding: 8px 12px; background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15); border-radius: 4px; font-size: 12px; color: var(--warning-color, #ff9800);"
                    >
                      <ha-icon
                        icon="mdi:alert-outline"
                        style="--mdc-icon-size: 14px; vertical-align: middle; margin-right: 4px;"
                      ></ha-icon>
                      ${localize(
                        'editor.logic.user_visibility.self_hidden_warning',
                        lang,
                        'You will not see this on the live dashboard while signed in as this user. Card Settings still keep the editor preview visible so you can keep editing.'
                      )}
                    </div>
                  `
                : nothing}
            </div>
          `
        : nothing}
    </div>
  `;
}
