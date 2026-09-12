import type { CSSProperties } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, EASE_OUT_CUBIC, FONT_STACK } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

type Placement = 'center' | 'bottom';

const placementStyle = (placement: Placement): CSSProperties =>
  placement === 'center'
    ? { top: 0, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : { left: 0, right: 0, bottom: 96, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' };

/**
 * Apple-style enter/exit: opacity + blur + slight scale, ease-out cubic. Nothing moves during the hold.
 * `inAt` / `outAt` are frames relative to the enclosing <Sequence>.
 */
export const useAppleReveal = (inAt: number, outAt?: number, enterFrames = 18, exitFrames = 12) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [inAt, inAt + enterFrames], [0, 1], { ...clamp, easing: EASE_OUT_CUBIC });
  const exit =
    outAt === undefined ? 1 : interpolate(frame, [outAt - exitFrames, outAt], [1, 0], { ...clamp, easing: EASE_OUT_CUBIC });
  const opacity = enter * exit;
  const blur = interpolate(enter, [0, 1], [16, 0]) + interpolate(exit, [0, 1], [8, 0]);
  const scale = interpolate(enter, [0, 1], [0.96, 1]);
  return {
    opacity,
    filter: `blur(${blur.toFixed(2)}px)`,
    transform: `scale(${scale.toFixed(4)})`,
    willChange: 'opacity, filter, transform',
  } satisfies CSSProperties;
};

export const Headline: React.FC<{
  text: string;
  inAt: number;
  outAt?: number;
  size?: number;
  placement?: Placement;
  weight?: number;
}> = ({ text, inAt, outAt, size = 120, placement = 'center', weight = 700 }) => {
  const reveal = useAppleReveal(inAt, outAt);
  return (
    <div style={{ position: 'absolute', ...placementStyle(placement), pointerEvents: 'none' }}>
      <div
        style={{
          ...reveal,
          fontFamily: FONT_STACK,
          fontSize: size,
          fontWeight: weight,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          color: COLORS.white,
          textAlign: 'center',
          textShadow: placement === 'bottom' ? '0 6px 40px rgba(0,0,0,0.6)' : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Small uppercase label that precedes a headline (e.g. THEME ENGINE). */
export const Kicker: React.FC<{ text: string; inAt: number; outAt?: number; offsetY?: number }> = ({
  text,
  inAt,
  outAt,
  offsetY = 150,
}) => {
  const reveal = useAppleReveal(inAt, outAt, 14, 10);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96 + offsetY, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          ...reveal,
          fontFamily: FONT_STACK,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: COLORS.secondary,
          textShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Multi-word headline where each word reveals on its own beat. */
export const StaggerWords: React.FC<{
  words: string[];
  firstIn: number;
  stagger: number;
  outAt: number;
  size?: number;
  placement?: Placement;
}> = ({ words, firstIn, stagger, outAt, size = 104, placement = 'bottom' }) => (
  <div style={{ position: 'absolute', ...placementStyle(placement), gap: size * 0.32, pointerEvents: 'none' }}>
    {words.map((word, i) => (
      <Word key={word + i} text={word} inAt={firstIn + i * stagger} outAt={outAt} size={size} />
    ))}
  </div>
);

const Word: React.FC<{ text: string; inAt: number; outAt: number; size: number }> = ({ text, inAt, outAt, size }) => {
  const reveal = useAppleReveal(inAt, outAt);
  return (
    <span
      style={{
        ...reveal,
        display: 'inline-block',
        fontFamily: FONT_STACK,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: COLORS.white,
        textShadow: '0 6px 40px rgba(0,0,0,0.6)',
      }}
    >
      {text}
    </span>
  );
};

/** Snappier montage word: spring scale-in, quick fade-out, no blur. */
export const PopWord: React.FC<{ text: string; inAt: number; outAt: number; size?: number }> = ({
  text,
  inAt,
  outAt,
  size = 96,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inAt, fps, config: { damping: 18, stiffness: 220, mass: 0.8 }, durationInFrames: 12 });
  const opacityIn = interpolate(frame, [inAt, inAt + 5], [0, 1], clamp);
  const opacityOut = interpolate(frame, [outAt - 6, outAt], [1, 0], clamp);
  return (
    <div style={{ position: 'absolute', ...placementStyle('bottom'), pointerEvents: 'none' }}>
      <div
        style={{
          opacity: opacityIn * opacityOut,
          transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`,
          fontFamily: FONT_STACK,
          fontSize: size,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: COLORS.white,
          textShadow: '0 6px 40px rgba(0,0,0,0.7)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Dark gradient behind bottom-placed text so it stays legible over footage. */
export const BottomVignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '34%',
      background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))',
      pointerEvents: 'none',
    }}
  />
);
