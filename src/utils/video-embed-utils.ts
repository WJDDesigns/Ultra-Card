/**
 * Video Embed Utilities
 * Utilities for handling YouTube, Vimeo, local, and URL-based video sources
 */

export interface VideoEmbedOptions {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  startTime?: number;
  opacity?: number;
  blur?: string;
  brightness?: string;
  scale?: number;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's already just an ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Extract Vimeo video ID from various URL formats
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;

  // Handle various Vimeo URL formats
  const patterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's already just an ID (numeric)
  if (/^\d+$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Get YouTube embed URL with proper parameters for background video
 */
export function getYouTubeEmbedUrl(videoId: string, options: VideoEmbedOptions = {}): string {
  const { autoplay = true, muted = true, loop = true, controls = false, startTime = 0 } = options;

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1', // Force mute
    controls: controls ? '1' : '0',
    showinfo: '0',
    modestbranding: '1',
    rel: '0',
    fs: '0',
    iv_load_policy: '3',
    disablekb: '1',
    playsinline: '1',
    enablejsapi: '0', // Disable JS API to prevent unmuting
  });

  // For looping, we need to add the playlist parameter
  if (loop) {
    params.append('loop', '1');
    params.append('playlist', videoId);
  }

  if (startTime > 0) {
    params.append('start', String(startTime));
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Get Vimeo embed URL with proper parameters for background video
 */
export function getVimeoEmbedUrl(videoId: string, options: VideoEmbedOptions = {}): string {
  const { autoplay = true, muted = true, loop = true, controls = false } = options;

  const params = new URLSearchParams({
    background: '1',
    autoplay: autoplay ? '1' : '0',
    muted: muted ? '1' : '0',
    loop: loop ? '1' : '0',
    controls: controls ? '1' : '0',
    byline: '0',
    portrait: '0',
    title: '0',
    transparent: '0',
    playsinline: '1',
  });

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}

/**
 * Create a video element for local or URL sources
 */
export function createVideoElement(src: string, options: VideoEmbedOptions = {}): HTMLVideoElement {
  const { autoplay = true, muted = true, loop = true, controls = false, scale = 1.0 } = options;

  const video = document.createElement('video');
  video.src = src;
  video.autoplay = autoplay;
  video.muted = muted;
  video.loop = loop;
  video.controls = controls;
  video.playsInline = true;
  video.style.position = 'absolute';
  video.style.top = '50%';
  video.style.left = '50%';
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.minWidth = '100vw';
  video.style.minHeight = '100vh';
  video.style.objectFit = 'cover';
  video.style.transform = `translate(-50%, -50%) scale(${scale})`;
  video.style.transformOrigin = 'center center';

  return video;
}

/**
 * Create an iframe element for YouTube or Vimeo
 */
export function createIframeElement(
  src: string,
  title: string = 'Video Background',
  scale: number = 1.0
): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.frameBorder = '0';
  iframe.allow = 'autoplay';
  iframe.allowFullscreen = false;
  iframe.style.position = 'absolute';
  iframe.style.border = 'none';
  iframe.style.pointerEvents = 'none';

  // For iframes to act like object-fit: cover, we need to make them oversized
  // The parent container's overflow: hidden will crop the excess
  // This ensures the video fills the entire viewport on all aspect ratios
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // On mobile, make iframe much larger to ensure coverage
    iframe.style.top = '50%';
    iframe.style.left = '50%';
    iframe.style.width = '177.77vh'; // 16:9 aspect ratio width based on height
    iframe.style.height = '100vh';
    iframe.style.minWidth = '100vw';
    iframe.style.minHeight = '56.25vw'; // 16:9 aspect ratio height based on width
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
  } else {
    // Desktop: standard coverage technique
    iframe.style.top = '50%';
    iframe.style.left = '50%';
    iframe.style.width = '177.77vh'; // 16:9 aspect ratio
    iframe.style.height = '100vh';
    iframe.style.minWidth = '100vw';
    iframe.style.minHeight = '56.25vw'; // 16:9 aspect ratio
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  iframe.style.transformOrigin = 'center center';

  return iframe;
}

/**
 * Get crossfade transition CSS
 */
export function getCrossfadeStyles(): string {
  return `
    @keyframes uc-video-bg-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes uc-video-bg-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .uc-video-bg-fade-in {
      animation: uc-video-bg-fade-in 0.8s ease-in-out forwards;
    }

    .uc-video-bg-fade-out {
      animation: uc-video-bg-fade-out 0.8s ease-in-out forwards;
    }
  `;
}

/**
 * Apply visual filters to video container
 */
export function applyVideoFilters(
  element: HTMLElement,
  opacity: number,
  blur: string,
  brightness: string
): void {
  const filters: string[] = [];

  if (blur && blur !== '0px') {
    filters.push(`blur(${blur})`);
  }

  if (brightness && brightness !== '100%') {
    filters.push(`brightness(${brightness})`);
  }

  element.style.filter = filters.length > 0 ? filters.join(' ') : '';
  element.style.opacity = String(opacity / 100);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if page is hidden (tab not visible)
 */
export function isPageHidden(): boolean {
  return document.hidden;
}
