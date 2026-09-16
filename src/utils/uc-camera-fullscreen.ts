import { HomeAssistant } from 'custom-card-helpers';
import { ucToastService } from '../services/uc-toast-service';
import { resolveOverlayLayer } from './uc-overlay-host';
import { Z_INDEX } from './uc-z-index';

export interface OpenCameraFullscreenOptions {
  entity: string;
  name?: string | undefined;
  showName?: boolean | undefined;
  showControls?: boolean | undefined;
  anchor?: HTMLElement | undefined;
  hass?: HomeAssistant | undefined;
}

/**
 * Picks where the fullscreen overlay is mounted.
 *
 * `ha-camera-stream` reads its API and connection from Lit contexts provided by the
 * `<home-assistant>` element, so an overlay parked on `document.body` would never resolve them
 * and the player would stay blank. Mounting inside that element's shadow root keeps the context
 * chain intact while `position: fixed` still covers the viewport.
 */
export function resolveCameraFullscreenHost(anchor?: HTMLElement): {
  host: HTMLElement | ShadowRoot;
  zIndex: number;
} {
  const insidePortal = !!anchor?.closest?.('.ultra-popup-portal');
  const zIndex = insidePortal ? Z_INDEX.GRAPH_TOOLTIP : Z_INDEX.CAMERA_FULLSCREEN_OVERLAY;
  const appRoot = document.querySelector('home-assistant');
  if (appRoot?.shadowRoot) {
    return { host: appRoot.shadowRoot, zIndex };
  }
  return { host: resolveOverlayLayer(anchor, zIndex).host, zIndex };
}

/** Walks the player's shadow trees to reach the `<video>` HA renders internally. */
export function findCameraVideoElement(root: Element): HTMLVideoElement | null {
  const queue: Array<Element | ShadowRoot> = [root];
  const seen = new Set<Element | ShadowRoot>();

  while (queue.length) {
    const node = queue.shift();
    if (!node || seen.has(node)) continue;
    seen.add(node);

    if (node instanceof HTMLVideoElement) return node;

    const shadow = (node as Element).shadowRoot;
    if (shadow) queue.push(shadow);
    queue.push(...Array.from(node.children));
  }

  return null;
}

export function addPinchZoomToCamera(cameraElement: HTMLElement, container: HTMLElement): void {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let lastDistance = 0;
  let isPinching = false;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastTouchX = 0;
  let lastTouchY = 0;

  const applyTransform = () => {
    cameraElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    cameraElement.style.transformOrigin = 'center center';
    cameraElement.style.transition = isPinching || isDragging ? 'none' : 'transform 0.2s ease';
  };

  const resetTransform = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
    cameraElement.style.cursor = 'default';
  };

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  container.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  container.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  const getPanLimits = () => {
    const rect = cameraElement.getBoundingClientRect();
    const scaledWidth = rect.width * scale;
    const scaledHeight = rect.height * scale;
    const maxX = Math.max(0, (scaledWidth - window.innerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - window.innerHeight) / 2);
    return { maxX, maxY };
  };

  const constrainPan = () => {
    if (scale > 1) {
      const { maxX, maxY } = getPanLimits();
      translateX = Math.max(-maxX, Math.min(maxX, translateX));
      translateY = Math.max(-maxY, Math.min(maxY, translateY));
    }
  };

  cameraElement.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();
        isPinching = true;
        lastDistance = getDistance(e.touches[0], e.touches[1]);
      } else if (e.touches.length === 1 && scale > 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    },
    { passive: false }
  );

  cameraElement.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        e.stopPropagation();

        const currentDistance = getDistance(e.touches[0], e.touches[1]);

        if (lastDistance > 0) {
          const scaleChange = currentDistance / lastDistance;
          scale *= scaleChange;
          scale = Math.max(1, Math.min(6, scale));

          if (scale > 1) {
            constrainPan();
          }

          applyTransform();
        }

        lastDistance = currentDistance;
      } else if (e.touches.length === 1 && scale > 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - lastTouchX;
        const deltaY = e.touches[0].clientY - lastTouchY;

        translateX += deltaX;
        translateY += deltaY;

        constrainPan();
        applyTransform();

        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    },
    { passive: false }
  );

  cameraElement.addEventListener('touchend', (e: TouchEvent) => {
    if (e.touches.length === 0) {
      isPinching = false;

      if (scale < 1.02) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      }

      applyTransform();
      cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
    } else if (e.touches.length === 1 && isPinching) {
      isPinching = false;

      if (scale < 1.02) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      }

      applyTransform();
    }
  });

  cameraElement.addEventListener('touchcancel', () => {
    isPinching = false;

    if (scale < 1.02) {
      scale = 1;
      translateX = 0;
      translateY = 0;
    }

    applyTransform();
    cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
  });

  cameraElement.addEventListener('mousedown', (e: MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      cameraElement.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      translateX += deltaX;
      translateY += deltaY;

      constrainPan();
      applyTransform();

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;

      if (scale < 1.02) {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
      }

      cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
    }
  });

  cameraElement.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault();

      const zoomSpeed = 0.15;
      const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;

      scale = Math.max(1, Math.min(6, scale + delta));

      if (scale < 1.02) {
        scale = 1;
        translateX = 0;
        translateY = 0;
      } else if (scale > 1) {
        constrainPan();
      }

      applyTransform();
      cameraElement.style.cursor = scale > 1 ? 'grab' : 'default';
    },
    { passive: false }
  );

  let lastTap = 0;

  cameraElement.addEventListener('touchend', (e: TouchEvent) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0 && e.touches.length === 0) {
      if (scale > 1) {
        resetTransform();
      } else {
        const touch = e.changedTouches[0];
        const rect = cameraElement.getBoundingClientRect();

        const tapX = touch.clientX - rect.left - rect.width / 2;
        const tapY = touch.clientY - rect.top - rect.height / 2;

        scale = 2.5;
        translateX = -tapX * (scale - 1);
        translateY = -tapY * (scale - 1);

        constrainPan();
        applyTransform();
        cameraElement.style.cursor = 'grab';
      }
    }

    lastTap = currentTime;
  });
}

/**
 * Opens a live camera feed in a fullscreen overlay with pinch-zoom, audio toggle,
 * and Escape-to-close. Mounts inside `<home-assistant>` so `ha-camera-stream`
 * keeps its Lit context.
 */
export function openCameraFullscreen(
  hass: HomeAssistant | undefined,
  options: OpenCameraFullscreenOptions
): void {
  const cameraEntity = options.entity;
  if (!cameraEntity) {
    ucToastService.error('No camera entity available');
    return;
  }

  document
    .querySelectorAll('[id^="ultra-camera-fullscreen-"]')
    .forEach(existing => (existing as any)._ultraClose?.() ?? existing.remove());
  const appRoot = document.querySelector('home-assistant');
  appRoot?.shadowRoot
    ?.querySelectorAll('[id^="ultra-camera-fullscreen-"]')
    .forEach(existing => (existing as any)._ultraClose?.() ?? existing.remove());

  const { host: overlayHost, zIndex: overlayZIndex } = resolveCameraFullscreenHost(options.anchor);
  const closeButtonZIndex =
    overlayZIndex >= Z_INDEX.GRAPH_TOOLTIP ? overlayZIndex : overlayZIndex + 1;

  const modalId = 'ultra-camera-fullscreen-' + Date.now();

  const modal = document.createElement('div');
  modal.id = modalId;
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0,0,0,0.95) !important;
    z-index: ${overlayZIndex} !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(10px) !important;
    touch-action: none !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
  `;

  const cameraWrapper = document.createElement('div');
  cameraWrapper.style.cssText = `
    position: relative !important;
    width: 100vw !important;
    height: 100vh !important;
    overflow: hidden !important;
    background: black !important;
  `;

  const cameraContainer = document.createElement('div');
  cameraContainer.id = modalId + '-camera-container';
  cameraContainer.style.cssText = `
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 300px !important;
    touch-action: none !important;
    user-select: none !important;
  `;

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute !important;
    top: 20px !important;
    right: 20px !important;
    width: 50px !important;
    height: 50px !important;
    border: 3px solid rgba(255,255,255,0.7) !important;
    background: rgba(0,0,0,0.8) !important;
    color: white !important;
    font-size: 30px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: ${closeButtonZIndex} !important;
    backdrop-filter: blur(4px) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
    font-family: Arial, sans-serif !important;
    line-height: 1 !important;
    transition: all 0.2s ease !important;
  `;

  if (options.showName !== false) {
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = `
      position: absolute !important;
      top: 20px !important;
      left: 20px !important;
      padding: 10px 16px !important;
      background: rgba(0,0,0,0.8) !important;
      color: white !important;
      border-radius: var(--uc-r-8, 8px) !important;
      font-size: 16px !important;
      font-weight: 500 !important;
      backdrop-filter: blur(4px) !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
    `;
    nameDiv.textContent = options.name || cameraEntity;
    cameraWrapper.appendChild(nameDiv);
  }

  cameraWrapper.appendChild(cameraContainer);
  cameraWrapper.appendChild(closeButton);
  modal.appendChild(cameraWrapper);
  overlayHost.appendChild(modal);

  const closeModal = () => {
    const restoreViewport = (modal as any)._restoreViewport;
    if (restoreViewport) {
      restoreViewport();
    }

    observer.disconnect();
    cameraContainer.replaceChildren();
    modal.remove();
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
  };
  (modal as any)._ultraClose = closeModal;

  const setupInteractions = () => {
    modal.removeAttribute('inert');
    closeButton.removeAttribute('inert');
    modal.style.pointerEvents = 'auto';
    closeButton.style.pointerEvents = 'auto';

    closeButton.addEventListener(
      'click',
      e => {
        e.stopPropagation();
        e.preventDefault();
        closeModal();
      },
      true
    );

    modal.addEventListener(
      'click',
      e => {
        if (e.target === modal) {
          e.stopPropagation();
          e.preventDefault();
          closeModal();
        }
      },
      true
    );
  };

  setupInteractions();
  setTimeout(setupInteractions, 100);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'inert') {
        const target = mutation.target as HTMLElement;
        if (target === modal || target === closeButton) {
          target.removeAttribute('inert');
          target.style.pointerEvents = 'auto';
        }
      }
    });
  });

  observer.observe(modal, { attributes: true });
  observer.observe(closeButton, { attributes: true });

  const resolvedHass =
    options.hass || hass || (document.querySelector('home-assistant') as any)?.hass;
  let fullscreenAudio = false;

  if (resolvedHass) {
    const streamEl = document.createElement('ha-camera-stream') as any;
    streamEl.setAttribute('data-camera-fullscreen', cameraEntity);
    streamEl.hass = resolvedHass;
    streamEl.stateObj = resolvedHass.states?.[cameraEntity];
    streamEl.fitMode = 'contain';
    streamEl.muted = true;
    streamEl.controls = options.showControls === true;
    streamEl.style.cssText = `
      width: 100vw !important;
      height: 100vh !important;
      display: block !important;
      --video-max-height: 100vh !important;
      transition: transform 0.2s ease !important;
      cursor: grab !important;
      touch-action: none !important;
    `;

    cameraContainer.replaceChildren(streamEl);
    addPinchZoomToCamera(streamEl, cameraContainer);

    const audioButton = document.createElement('button');
    audioButton.type = 'button';
    audioButton.className = 'camera-fullscreen-audio';
    audioButton.textContent = '🔇';
    audioButton.setAttribute('aria-label', 'Toggle audio');
    audioButton.style.cssText = `
      position: absolute !important;
      top: 20px !important;
      right: 84px !important;
      width: 50px !important;
      height: 50px !important;
      border: 3px solid rgba(255,255,255,0.7) !important;
      background: rgba(0,0,0,0.8) !important;
      color: white !important;
      font-size: 22px !important;
      cursor: pointer !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: ${closeButtonZIndex} !important;
      backdrop-filter: blur(4px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
      line-height: 1 !important;
    `;
    audioButton.addEventListener('click', event => {
      event.stopPropagation();
      event.preventDefault();
      fullscreenAudio = !fullscreenAudio;
      streamEl.muted = !fullscreenAudio;
      audioButton.textContent = fullscreenAudio ? '🔊' : '🔇';
      const video = findCameraVideoElement(streamEl);
      if (video) {
        video.muted = !fullscreenAudio;
        video.volume = fullscreenAudio ? 1 : 0;
        if (video.paused) void video.play().catch(() => {});
      }
    });
    cameraWrapper.appendChild(audioButton);
  } else {
    const fallbackImg = document.createElement('img');
    fallbackImg.src = '';
    fallbackImg.style.cssText = `
      width: 100vw !important;
      height: 100vh !important;
      display: block !important;
      object-fit: contain !important;
      cursor: grab !important;
      touch-action: none !important;
    `;

    cameraContainer.replaceChildren(fallbackImg);
    addPinchZoomToCamera(fallbackImg, cameraContainer);
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.style.overflow = 'hidden';

  const originalViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  const originalContent = originalViewport?.content || '';

  if (originalViewport) {
    originalViewport.content =
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }

  const restoreViewport = () => {
    if (originalViewport) {
      originalViewport.content = originalContent;
    }
  };

  (modal as any)._restoreViewport = restoreViewport;
}
