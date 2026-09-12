import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { BottomVignette, Headline, Kicker, PopWord, StaggerWords } from './components/AppleText';
import { ClipSlot } from './components/ClipSlot';
import { EndCard } from './components/EndCard';
import { MusicTrack } from './components/MusicTrack';
import { COPY, SHOTS, TEXT, type Shot } from './storyboard';
import { COLORS } from './theme';

const ShotSequence: React.FC<{ shot: Shot; children?: React.ReactNode }> = ({ shot, children }) => (
  <Sequence from={shot.start} durationInFrames={shot.duration} name={shot.id}>
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {shot.cuts.map((cut) => (
        <ClipSlot key={cut.file} cut={cut} />
      ))}
      {shot.cuts.length > 0 ? <BottomVignette /> : null}
      {children}
    </AbsoluteFill>
  </Sequence>
);

const DipToBlack: React.FC<{ start: number; end: number }> = ({ start, end }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ backgroundColor: COLORS.black, opacity }} />;
};

export const Teaser: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
    <MusicTrack />

    {/* 1 — Cold open */}
    <ShotSequence shot={SHOTS.hook}>
      <Headline text={COPY.hook} inAt={TEXT.hook.in} size={132} />
    </ShotSequence>

    {/* 2 — Layout Builder */}
    <ShotSequence shot={SHOTS.layoutBuilder}>
      <StaggerWords
        words={COPY.layoutWords}
        firstIn={TEXT.layoutWords.firstIn}
        stagger={TEXT.layoutWords.stagger}
        outAt={TEXT.layoutWords.out}
      />
    </ShotSequence>

    {/* 3 — Modules */}
    <ShotSequence shot={SHOTS.modules}>
      <Headline text={COPY.modulesA} inAt={TEXT.modulesA.in} outAt={TEXT.modulesA.out} size={112} placement="bottom" />
      <Headline text={COPY.modulesB} inAt={TEXT.modulesB.in} outAt={TEXT.modulesB.out} size={112} placement="bottom" />
    </ShotSequence>

    {/* 4 — Theme Engine */}
    <ShotSequence shot={SHOTS.themeEngine}>
      <Kicker text={COPY.themeKicker} inAt={TEXT.themeKicker.in} outAt={TEXT.themeHeadline.out} offsetY={132} />
      <Headline text={COPY.themeHeadline} inAt={TEXT.themeHeadline.in} outAt={TEXT.themeHeadline.out} size={104} placement="bottom" />
    </ShotSequence>

    {/* 5 — Template Mode */}
    <ShotSequence shot={SHOTS.templateMode}>
      <Kicker text={COPY.templateKicker} inAt={TEXT.templateKicker.in} outAt={TEXT.templateHeadline.out} offsetY={132} />
      <Headline
        text={COPY.templateHeadline}
        inAt={TEXT.templateHeadline.in}
        outAt={TEXT.templateHeadline.out}
        size={104}
        placement="bottom"
      />
    </ShotSequence>

    {/* 6 — Examples montage */}
    <ShotSequence shot={SHOTS.montage}>
      {TEXT.montageWords.map((w) => (
        <PopWord key={w.text} text={w.text} inAt={w.in} outAt={w.out} />
      ))}
      <DipToBlack start={TEXT.montageDipToBlack.start} end={SHOTS.montage.duration} />
    </ShotSequence>

    {/* 7 — Closing title */}
    <Sequence from={SHOTS.endCard.start} durationInFrames={SHOTS.endCard.duration} name={SHOTS.endCard.id}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
