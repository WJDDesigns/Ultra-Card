import { Z_INDEX } from '../utils/uc-z-index';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType | undefined;
  duration?: number | undefined;
}

const TOAST_CONTAINER_ID = 'uc-toast-live-region';

class UcToastService {
  private _container: HTMLElement | null = null;

  private _ensureContainer(): HTMLElement {
    if (this._container && document.body.contains(this._container)) {
      return this._container;
    }

    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
      container = document.createElement('div');
      container.id = TOAST_CONTAINER_ID;
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      container.style.cssText = `
        position: fixed;
        top: 16px;
        right: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: ${Z_INDEX.TOAST_NOTIFICATION};
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    this._container = container;
    return container;
  }

  show(messageOrOpts: string | ToastOptions, type?: ToastType, duration?: number): void {
    const opts: ToastOptions =
      typeof messageOrOpts === 'string'
        ? { message: messageOrOpts, type: type ?? 'info', duration: duration ?? 3000 }
        : messageOrOpts;

    const resolvedType = opts.type ?? 'info';
    const resolvedDuration = opts.duration ?? 3000;
    const container = this._ensureContainer();

    if (resolvedType === 'error') {
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-live', 'assertive');
    } else {
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
    }

    const toast = document.createElement('div');
    toast.setAttribute('aria-atomic', 'true');
    toast.textContent = opts.message;

    const colorVar =
      resolvedType === 'success'
        ? 'var(--success-color, #4caf50)'
        : resolvedType === 'error'
          ? 'var(--error-color, #f44336)'
          : resolvedType === 'warning'
            ? 'var(--warning-color, #ff9800)'
            : 'var(--primary-color, #03a9f4)';

    toast.style.cssText = `
      padding: 10px 20px;
      background: ${colorVar};
      color: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      pointer-events: auto;
      opacity: 0;
      transform: translateX(40px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      max-width: 360px;
      word-break: break-word;
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.setAttribute('role', 'status');
          container.setAttribute('aria-live', 'polite');
        }
      }, 260);
    }, resolvedDuration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 4000);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
}

export const ucToastService = new UcToastService();
