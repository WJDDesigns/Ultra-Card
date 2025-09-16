import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { localize } from '../../localize/localize';
import { VERSION } from '../../version';
import { DEFAULT_VEHICLE_IMAGE, DEFAULT_VEHICLE_IMAGE_FALLBACK } from '../../utils/constants';

@customElement('ultra-about-tab')
export class AboutTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  protected render(): TemplateResult | typeof nothing {
    const lang = this.hass?.locale?.language || 'en';
    return html`
      <div class="about-tab">
        <div class="about-logo-container">
          <img
            src="${DEFAULT_VEHICLE_IMAGE}"
            alt="Ultra Card"
            class="about-logo"
            @error=${(e: Event) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img && img.src !== DEFAULT_VEHICLE_IMAGE_FALLBACK) {
                img.src = DEFAULT_VEHICLE_IMAGE_FALLBACK;
              }
            }}
          />
        </div>

        <div class="about-developed-by">
          ${localize('editor.about.developed_by', lang, 'Developed by')}
          <a href="https://wjddesigns.com" target="_blank" rel="noopener">WJD Designs</a>
        </div>

        <div class="about-description">
          <p>
            ${localize(
              'editor.about.desc1',
              lang,
              'A powerful modular card builder for Home Assistant'
            )}
          </p>
          <p>
            ${localize(
              'editor.about.desc2',
              lang,
              'Create custom layouts with a professional page-builder interface'
            )}
          </p>
          <p>
            ${localize(
              'editor.about.desc3',
              lang,
              'Modular layout system with conditional logic and professional design tools'
            )}
          </p>
        </div>

        <div class="about-buttons">
          <a
            href="https://discord.gg/6xVgHxzzBV"
            target="_blank"
            rel="noopener"
            class="about-button discord"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
              />
            </svg>
            ${localize('editor.about.join_discord', lang, 'Join Our Discord')}
          </a>

          <a
            href="https://github.com/WJDDesigns/Ultra-Card"
            target="_blank"
            rel="noopener"
            class="about-button github"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            ${localize('editor.about.github_repo', lang, 'Check Out Our Github')}
          </a>
        </div>

        <div class="support-section">
          <h3>${localize('editor.about.support_title', lang, 'Support Ultra Card')}</h3>
          <p>
            ${localize(
              'editor.about.support_desc',
              lang,
              "Your generous tips fuel the development of amazing features for this card! Without support from users like you, continued innovation wouldn't be possible."
            )}
          </p>

          <a
            href="https://www.paypal.com/ncp/payment/NLHALFSPA7PUS"
            target="_blank"
            rel="noopener"
            class="about-button paypal"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" class="about-button-icon">
              <path
                fill="currentColor"
                d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.555.493l-1.07 6.781a.382.382 0 0 0 .378.44h3.613a.896.896 0 0 0 .884-.764l.035-.234.65-4.135.041-.29a.896.896 0 0 1 .884-.763h.557c3.748 0 6.68-1.526 7.534-5.942.356-1.846.174-3.388-.777-4.471z"
              />
            </svg>
            ${localize('editor.about.leave_tip', lang, 'LEAVE A TIP (PAYPAL)')}
          </a>
        </div>

        <div class="version-info">
          <p>${localize('editor.about.version', lang, 'Version')} ${VERSION}</p>
        </div>
      </div>
    `;
  }

  static styles = css`
    .about-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      color: var(--primary-text-color);
    }

    .about-logo-container {
      margin-bottom: 24px;
    }

    .about-logo {
      max-width: 300px;
      width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .about-developed-by {
      font-size: 1.2em;
      margin-bottom: 24px;
      color: var(--secondary-text-color);
      text-align: center;
    }

    .about-developed-by a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: bold;
    }

    .about-developed-by a:hover {
      text-decoration: underline;
    }

    .about-description {
      text-align: center;
      margin-bottom: 32px;
    }

    .about-description p {
      margin: 8px 0;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }

    .about-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 300px;
      margin-bottom: 32px;
    }

    .about-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      color: white;
      border: none;
      font-size: 14px;
    }

    .about-button svg {
      margin-right: 8px;
      fill: currentColor;
    }

    .about-button.discord {
      background-color: #5865f2;
    }

    .about-button.github {
      background-color: #24292e;
    }

    .about-button.paypal {
      background-color: #0070ba;
    }

    .about-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .support-section {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
    }

    .support-section h3 {
      color: var(--primary-color);
      margin: 0 0 16px 0;
      font-size: 1.5em;
    }

    .support-section p {
      color: var(--secondary-text-color);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .version-info {
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }

    .version-info p {
      margin: 4px 0;
    }
  `;
}
