import { AbsoluteFill, OffthreadVideo, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame } from 'remotion';
import type { ClipCut } from '../storyboard';
import { COLORS, FONT_STACK } from '../theme';

const hasStaticFile = (name: string) => getStaticFiles().some((f) => f.name === name);

/**
 * A recorded-footage slot: rounded frame on black, soft brand glow, slow Ken Burns zoom.
 * Renders <OffthreadVideo> from public/clips/<file>; if the file is missing it draws a labelled
 * placeholder so Studio and renders never break while footage is still being captured.
 */
export const ClipSlot: React.FC<{ cut: ClipCut }> = ({ cut }) => (
  <Sequence from={cut.from} durationInFrames={cut.duration} name={cut.label} layout="none">
    <ClipFrame cut={cut} />
  </Sequence>
);

const ClipFrame: React.FC<{ cut: ClipCut }> = ({ cut }) => {
  const frame = useCurrentFrame();
  const [zoomFrom, zoomTo] = cut.zoom ?? [1, 1];
  const zoom = interpolate(frame, [0, cut.duration], [zoomFrom, zoomTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const relPath = `clips/${cut.file}`;
  const available = hasStaticFile(relPath);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          width: '72%',
          height: '62%',
          borderRadius: 200,
          background: `radial-gradient(ellipse at 30% 40%, ${COLORS.cyan}, transparent 60%), radial-gradient(ellipse at 70% 65%, ${COLORS.violet}, transparent 60%)`,
          filter: 'blur(120px)',
          opacity: 0.28,
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '88%',
          aspectRatio: '16 / 9',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 120px rgba(0,0,0,0.6)',
          backgroundColor: '#0b0b10',
        }}
      >
        <div style={{ width: '100%', height: '100%', transform: `scale(${zoom.toFixed(4)})`, transformOrigin: '50% 50%' }}>
          {available ? (
            <OffthreadVideo
              src={staticFile(relPath)}
              trimBefore={cut.trimBefore}
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <MissingClip cut={cut} />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MissingClip: React.FC<{ cut: ClipCut }> = ({ cut }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #3b0764 100%)',
      fontFamily: FONT_STACK,
      color: COLORS.white,
    }}
  >
    <div style={{ fontSize: 22, letterSpacing: '0.2em', opacity: 0.5 }}>MISSING CLIP</div>
    <div style={{ fontSize: 40, fontWeight: 600 }}>{cut.file}</div>
    <div style={{ fontSize: 28, opacity: 0.7 }}>{cut.label}</div>
    <div style={{ fontSize: 22, opacity: 0.5 }}>drop the recording into promo/public/clips/</div>
  </div>
);
