export type UcAlignment = 'left' | 'center' | 'right';

export const ucAlignmentToJustify = (a?: UcAlignment): string => {
  switch (a) {
    case 'left':
      return 'flex-start';
    case 'right':
      return 'flex-end';
    default:
      return 'center';
  }
};
