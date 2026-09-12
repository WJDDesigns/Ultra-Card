import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COPY, SHOTS, TEXT } from '../storyboard';
import { COLORS, EASE_OUT_CUBIC, FONT_STACK } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Closing title. Uses the brand artwork from the repo's assets/ (copied to public/brand/).
 * The JPG already contains the UC monogram and the ULTRA CARD wordmark, so only the URL and tagline are typeset.
 * Swap in a transparent PNG/SVG wordmark here if one becomes available.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const total = SHOTS.endCard.duration;

  const logoIn = interpolate(frame, [TEXT.endLogo.in, TEXT.endLogo.in + 24], [0, 1], { ...clamp, easing: EASE_OUT_CUBIC });
  const logoScale = interpolate(logoIn, [0, 1], [1.06, 1]);
  const logoBlur = interpolate(logoIn, [0, 1], [12, 0]);

  const urlIn = interpolate(frame, [TEXT.endUrl.in, TEXT.endUrl.in + 18], [0, 1], { ...clamp, easing: EASE_OUT_CUBIC });
  const tagIn = interpolate(frame, [TEXT.endTagline.in, TEXT.endTagline.in + 18], [0, 1], { ...clamp, easing: EASE_OUT_CUBIC });
  const fadeOut = interpolate(frame, [total - 8, total], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <AbsoluteFill style={{ opacity: logoIn * fadeOut }}>
        <Img
          src={staticFile('brand/ultra-card-logo.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            // 16:10 artwork on a 16:9 canvas: crop from the top so the baked-in wordmark sits above the URL line.
            objectPosition: '50% 100%',
            transform: `scale(${logoScale.toFixed(4)})`,
            filter: `blur(${logoBlur.toFixed(2)}px)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 26%)',
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 64,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          fontFamily: FONT_STACK,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            opacity: urlIn,
            transform: `translateY(${interpolate(urlIn, [0, 1], [14, 0])}px)`,
            filter: `blur(${interpolate(urlIn, [0, 1], [8, 0])}px)`,
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: COLORS.white,
          }}
        >
          {COPY.endUrl}
        </div>
        <div
          style={{
            opacity: tagIn * 0.75,
            transform: `translateY(${interpolate(tagIn, [0, 1], [10, 0])}px)`,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: COLORS.white,
          }}
        >
          {COPY.endTagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
