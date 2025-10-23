/**
 * Video Background Service
 * Manages view-wide video backgrounds across all Ultra Card instances
 * Handles priority resolution, conditional logic, and background layer rendering
 */

import { HomeAssistant } from 'custom-card-helpers';
import { VideoBackgroundModule, UltraCardConfig } from '../types';
import { logicService } from './logic-service';
import { ucGlobalTransparencyService } from './uc-global-transparency-service';
import {
  extractYouTubeId,
  extractVimeoId,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
  createVideoElement,
  createIframeElement,
  applyVideoFilters,
  prefersReducedMotion,
  isPageHidden,
  getCrossfadeStyles,
} from '../utils/video-embed-utils';

interface RegisteredModule {
  cardId: string;
  moduleId: string;
  module: VideoBackgroundModule;
  hass: HomeAssistant;
  config: UltraCardConfig;
  element: HTMLElement | null; // Reference to the card element for DOM order
  registeredAt: number;
}

interface ActiveVideo {
  source: 'local' | 'url' | 'youtube' | 'vimeo';
  url: string;
  loop: boolean;
  startTime: number;
  element: HTMLVideoElement | HTMLIFrameElement;
}

class UcVideoBgService {
  private registeredModules: Map<string, RegisteredModule> = new Map();
  private backgroundLayer: HTMLElement | null = null;
  private activeVideo: ActiveVideo | null = null;
  private visibilityHandler: (() => void) | null = null;
  private updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private styleElement: HTMLStyleElement | null = null;

  /**
   * Register a video background module
   */
  registerModule(
    cardId: string,
    moduleId: string,
    module: VideoBackgroundModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    element: HTMLElement | null = null
  ): void {
    const key = `${cardId}-${moduleId}`;

    this.registeredModules.set(key, {
      cardId,
      moduleId,
      module,
      hass,
      config,
      element,
      registeredAt: Date.now(),
    });

    // Debounced update to prevent rapid re-evaluations
    this.scheduleUpdate();
  }

  /**
   * Unregister a video background module
   */
  unregisterModule(cardId: string, moduleId: string): void {
    const key = `${cardId}-${moduleId}`;
    this.registeredModules.delete(key);

    // If no more modules, clean up
    if (this.registeredModules.size === 0) {
      this.cleanup();
    } else {
      this.scheduleUpdate();
    }
  }

  /**
   * Schedule an update (debounced)
   */
  private scheduleUpdate(): void {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }

    this.updateDebounceTimer = setTimeout(() => {
      this.evaluateAndRender();
      this.updateDebounceTimer = null;
    }, 150);
  }

  /**
   * Evaluate priority and render the winning module
   */
  private evaluateAndRender(): void {
    const activeModule = this.evaluateActiveModule();

    if (!activeModule) {
      this.removeBackground();
      return;
    }

    // Check if mobile and if enabled on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !activeModule.module.enable_on_mobile) {
      this.removeBackground();
      return;
    }

    // Apply global transparency if enabled
    if (activeModule.module.global_card_transparency?.enabled) {
      ucGlobalTransparencyService.apply(
        activeModule.module.global_card_transparency,
        `${activeModule.cardId}-${activeModule.moduleId}`
      );
    } else {
      ucGlobalTransparencyService.restore(`${activeModule.cardId}-${activeModule.moduleId}`);
    }

    // Determine which video to play
    const videoConfig = this.resolveVideoConfig(activeModule);

    if (!videoConfig) {
      this.removeBackground();
      return;
    }

    // Render the background
    this.renderBackground(videoConfig, activeModule.module);
  }

  /**
   * Evaluate which module should be active based on priority and logic
   */
  private evaluateActiveModule(): RegisteredModule | null {
    if (this.registeredModules.size === 0) return null;

    // Get all modules as array
    const modules = Array.from(this.registeredModules.values());

    // Sort by DOM order (topmost first)
    modules.sort((a, b) => {
      // If both have elements, use DOM order
      if (a.element && b.element) {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      }
      // Fallback to registration time
      return a.registeredAt - b.registeredAt;
    });

    // Find first module that is enabled and passes logic conditions
    for (const registered of modules) {
      const { module, hass } = registered;

      // Check if enabled
      if (!module.enabled) continue;

      // Check display conditions using logic service
      const shouldDisplay = logicService.evaluateDisplayConditions(
        module.display_conditions || [],
        module.display_mode || 'always'
      );

      if (shouldDisplay) {
        return registered;
      }
    }

    return null;
  }

  /**
   * Resolve which video configuration to use (default or conditional rule)
   */
  private resolveVideoConfig(
    registered: RegisteredModule
  ): { source: string; url: string; loop: boolean; startTime: number; scale: number } | null {
    const { module, hass } = registered;

    // Check conditional rules first (top to bottom)
    if (module.rules && module.rules.length > 0) {
      for (const rule of module.rules) {
        // Convert rule to display condition format
        const condition: any = {
          id: rule.id,
          type: rule.condition_type,
          entity: rule.entity,
          attribute: rule.attribute,
          operator: rule.operator,
          value: rule.value,
          template: rule.template,
          time_from: rule.time_from,
          time_to: rule.time_to,
        };

        // Evaluate this rule's condition
        const matches = logicService.evaluateDisplayConditions([condition], 'any');

        if (matches) {
          return {
            source: rule.video_source,
            url: rule.video_url,
            loop: rule.loop !== false,
            startTime: rule.start_time || 0,
            scale: module.scale || 1.0,
          };
        }
      }
    }

    // Fall back to default video
    if (!module.default_video_url) return null;

    return {
      source: module.default_source,
      url: module.default_video_url,
      loop: module.default_loop !== false,
      startTime: module.default_start_time || 0,
      scale: module.scale || 1.0,
    };
  }

  /**
   * Render the background video layer
   */
  private renderBackground(
    videoConfig: { source: string; url: string; loop: boolean; startTime: number; scale: number },
    module: VideoBackgroundModule
  ): void {
    // Check if we need to swap video
    const needsSwap =
      !this.activeVideo ||
      this.activeVideo.source !== videoConfig.source ||
      this.activeVideo.url !== videoConfig.url;

    if (!needsSwap) {
      // Just update filters if needed
      if (this.backgroundLayer) {
        applyVideoFilters(this.backgroundLayer, module.opacity, module.blur, module.brightness);
      }
      return;
    }

    // Create background layer if it doesn't exist
    this.ensureBackgroundLayer();

    // Handle reduced motion preference
    if (module.respect_reduced_motion && prefersReducedMotion()) {
      this.showReducedMotionFallback();
      return;
    }

    // Create new video element
    const newVideoElement = this.createVideoForSource(videoConfig);

    if (!newVideoElement || !this.backgroundLayer) return;

    // Crossfade transition
    if (this.activeVideo && this.activeVideo.element) {
      const oldElement = this.activeVideo.element;
      oldElement.classList.add('uc-video-bg-fade-out');

      setTimeout(() => {
        if (oldElement.parentElement) {
          oldElement.parentElement.removeChild(oldElement);
        }
      }, 800);
    }

    // Add new element with fade in
    newVideoElement.classList.add('uc-video-bg-fade-in');
    this.backgroundLayer.appendChild(newVideoElement);

    // Apply filters
    applyVideoFilters(this.backgroundLayer, module.opacity, module.blur, module.brightness);

    // Store active video
    this.activeVideo = {
      source: videoConfig.source as any,
      url: videoConfig.url,
      loop: videoConfig.loop,
      startTime: videoConfig.startTime,
      element: newVideoElement,
    };

    // Setup pause on hidden if enabled
    if (module.pause_when_hidden) {
      this.setupVisibilityHandling();
    }
  }

  /**
   * Create video element for the given source
   */
  private createVideoForSource(videoConfig: {
    source: string;
    url: string;
    loop: boolean;
    startTime: number;
    scale: number;
  }): HTMLVideoElement | HTMLIFrameElement | null {
    const { source, url, loop, startTime, scale } = videoConfig;

    switch (source) {
      case 'youtube': {
        const videoId = extractYouTubeId(url);
        if (!videoId) return null;

        const embedUrl = getYouTubeEmbedUrl(videoId, {
          autoplay: true,
          muted: true,
          loop,
          controls: false,
          startTime,
        });

        return createIframeElement(embedUrl, 'YouTube Video Background', scale);
      }

      case 'vimeo': {
        const videoId = extractVimeoId(url);
        if (!videoId) return null;

        const embedUrl = getVimeoEmbedUrl(videoId, {
          autoplay: true,
          muted: true,
          loop,
          controls: false,
        });

        return createIframeElement(embedUrl, 'Vimeo Video Background', scale);
      }

      case 'local':
      case 'url': {
        const video = createVideoElement(url, {
          autoplay: true,
          muted: true,
          loop,
          controls: false,
          scale,
        });

        if (startTime > 0) {
          video.currentTime = startTime;
        }

        return video;
      }

      default:
        return null;
    }
  }

  /**
   * Ensure background layer exists (inserts into hui-view-background)
   */
  private ensureBackgroundLayer(): void {
    if (this.backgroundLayer && this.backgroundLayer.isConnected) return;

    // Look for existing hui-view-background element
    let huiViewBackground = document.querySelector('hui-view-background') as HTMLElement;

    if (!huiViewBackground) {
      // If not found, try to find it within the view
      const viewContainer = this.findViewContainer();
      if (viewContainer) {
        huiViewBackground = viewContainer.querySelector('hui-view-background') as HTMLElement;
      }
    }

    // Create our video container - always use fixed positioning to cover full viewport
    this.backgroundLayer = document.createElement('div');
    this.backgroundLayer.id = 'uc-video-bg-layer';
    this.backgroundLayer.style.position = 'fixed';
    this.backgroundLayer.style.top = '0';
    this.backgroundLayer.style.left = '0';
    this.backgroundLayer.style.width = '100vw';
    this.backgroundLayer.style.height = '100dvh'; // Use dynamic viewport height for mobile
    this.backgroundLayer.style.minHeight = '100vh'; // Fallback for older browsers
    this.backgroundLayer.style.zIndex = '0'; // Key: z-index 0 makes it visible behind cards
    this.backgroundLayer.style.pointerEvents = 'none';
    this.backgroundLayer.style.overflow = 'hidden';

    // Inject crossfade styles
    this.injectStyles();

    if (huiViewBackground) {
      // Insert into hui-view-background and make it transparent so video shows
      huiViewBackground.style.overflow = 'hidden';
      huiViewBackground.style.background = 'transparent';
      huiViewBackground.style.backgroundColor = 'transparent';
      huiViewBackground.style.position = 'fixed';
      huiViewBackground.style.top = '0';
      huiViewBackground.style.left = '0';
      huiViewBackground.style.width = '100vw';
      huiViewBackground.style.height = '100dvh'; // Use dynamic viewport height for mobile
      huiViewBackground.style.minHeight = '100vh'; // Fallback for older browsers
      huiViewBackground.style.zIndex = '-1';
      huiViewBackground.appendChild(this.backgroundLayer);
    } else {
      // Fallback: insert into view container
      const viewContainer = this.findViewContainer();
      if (!viewContainer) {
        console.warn('Ultra Card Video BG: Could not find view container');
        return;
      }

      viewContainer.insertBefore(this.backgroundLayer, viewContainer.firstChild);
    }
  }

  /**
   * Inject CSS styles for transitions
   */
  private injectStyles(): void {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      ${getCrossfadeStyles()}
      
      /* Mobile-specific video coverage */
      @media (max-width: 768px) {
        #uc-video-bg-layer {
          height: 100dvh !important;
          min-height: 100vh !important;
        }
        
        #uc-video-bg-layer video,
        #uc-video-bg-layer iframe {
          min-width: 100vw !important;
          min-height: 100dvh !important;
          object-fit: cover !important;
        }
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Find the view container to inject background into
   */
  private findViewContainer(): HTMLElement | null {
    const selectors = [
      'hui-view',
      'hui-sections-view',
      'hui-masonry-view',
      'hui-panel-view',
      '.view',
      'ha-panel-lovelace',
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector) as HTMLElement;
      if (container) return container;
    }

    return document.body;
  }

  /**
   * Setup visibility handling for pause when hidden
   */
  private setupVisibilityHandling(): void {
    if (this.visibilityHandler) return;

    this.visibilityHandler = () => {
      if (!this.activeVideo) return;

      const hidden = isPageHidden();
      const element = this.activeVideo.element;

      if (element instanceof HTMLVideoElement) {
        if (hidden) {
          element.pause();
        } else {
          element.play().catch(() => {
            // Autoplay might be blocked
          });
        }
      }
      // For iframes, we can't control playback, but they should auto-pause when hidden
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /**
   * Show reduced motion fallback
   */
  private showReducedMotionFallback(): void {
    if (!this.backgroundLayer) return;

    this.backgroundLayer.innerHTML = '';
    this.backgroundLayer.style.background = 'var(--primary-background-color)';
    this.backgroundLayer.style.display = 'flex';
    this.backgroundLayer.style.alignItems = 'center';
    this.backgroundLayer.style.justifyContent = 'center';

    const message = document.createElement('div');
    message.textContent = 'Video background paused (reduced motion)';
    message.style.color = 'var(--secondary-text-color)';
    message.style.fontSize = '14px';
    this.backgroundLayer.appendChild(message);

    this.activeVideo = null;
  }

  /**
   * Remove background layer
   */
  private removeBackground(): void {
    if (this.backgroundLayer && this.backgroundLayer.parentElement) {
      // Restore hui-view-background styles if we modified them
      const huiViewBackground = document.querySelector('hui-view-background') as HTMLElement;
      if (huiViewBackground && this.backgroundLayer.parentElement === huiViewBackground) {
        huiViewBackground.style.background = '';
        huiViewBackground.style.backgroundColor = '';
        huiViewBackground.style.position = '';
        huiViewBackground.style.top = '';
        huiViewBackground.style.left = '';
        huiViewBackground.style.width = '';
        huiViewBackground.style.height = '';
        huiViewBackground.style.zIndex = '';
        huiViewBackground.style.overflow = '';
      }

      this.backgroundLayer.parentElement.removeChild(this.backgroundLayer);
    }

    this.backgroundLayer = null;
    this.activeVideo = null;

    // Restore all card transparency
    ucGlobalTransparencyService.restore();
  }

  /**
   * Full cleanup
   */
  cleanup(): void {
    this.removeBackground();

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.styleElement && this.styleElement.parentElement) {
      this.styleElement.parentElement.removeChild(this.styleElement);
      this.styleElement = null;
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }

    this.registeredModules.clear();
  }

  /**
   * Force immediate re-evaluation (for entity state changes)
   */
  forceUpdate(): void {
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
      this.updateDebounceTimer = null;
    }
    this.evaluateAndRender();
  }

  /**
   * Get current active module count
   */
  getActiveModuleCount(): number {
    return this.registeredModules.size;
  }
}

// Export singleton instance
export const ucVideoBgService = new UcVideoBgService();
