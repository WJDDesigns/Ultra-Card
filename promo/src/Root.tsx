import { Composition } from 'remotion';
import { Teaser } from './Teaser';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from './storyboard';

export const RemotionRoot = () => (
  <Composition
    id="UltraCardTeaser"
    component={Teaser}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
