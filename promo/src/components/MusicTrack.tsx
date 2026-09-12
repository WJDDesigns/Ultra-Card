import { Audio, getStaticFiles, interpolate, staticFile } from 'remotion';
import { MUSIC } from '../storyboard';

/**
 * Background music slot with fade-in and a long fade-out into the end card.
 * Renders nothing until public/music/teaser-music.mp3 exists, so the project stays renderable without a track.
 */
export const MusicTrack: React.FC = () => {
  const present = getStaticFiles().some((f) => f.name === MUSIC.file);
  if (!present) return null;

  return (
    <Audio
      src={staticFile(MUSIC.file)}
      volume={(f) =>
        MUSIC.volume *
        interpolate(f, [0, MUSIC.fadeInFrames, MUSIC.fadeOutStart, MUSIC.fadeOutEnd], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />
  );
};
