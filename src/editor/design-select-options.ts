import { localize } from '../localize/localize';

export type DesignSelectOption = { value: string; label: string };

function opt(value: string, label: string): DesignSelectOption {
  return { value, label };
}

/** Shared option lists for Design tab selects (stored enum values must stay stable). */
export function getDesignSelectOptions(lang: string) {
  const def = localize('editor.design.default_option', lang, '– Default –');
  const none = localize('editor.design.none', lang, 'None');

  return {
    fontWeight: [
      opt('', def),
      opt('100', localize('editor.design.weight_thin', lang, '100 - Thin')),
      opt('300', localize('editor.design.weight_light', lang, '300 - Light')),
      opt('400', localize('editor.design.weight_normal', lang, '400 - Normal')),
      opt('500', localize('editor.design.weight_medium', lang, '500 - Medium')),
      opt('600', localize('editor.design.weight_semi_bold', lang, '600 - Semi Bold')),
      opt('700', localize('editor.design.weight_bold', lang, '700 - Bold')),
      opt('900', localize('editor.design.weight_black', lang, '900 - Black')),
    ],
    textTransform: [
      opt('', def),
      opt('none', localize('editor.design.transform_none', lang, 'None')),
      opt('uppercase', localize('editor.design.transform_uppercase', lang, 'UPPERCASE')),
      opt('lowercase', localize('editor.design.transform_lowercase', lang, 'lowercase')),
      opt('capitalize', localize('editor.design.transform_capitalize', lang, 'Capitalize')),
    ],
    fontStyle: [
      opt('', def),
      opt('normal', localize('editor.design.style_normal', lang, 'Normal')),
      opt('italic', localize('editor.design.style_italic', lang, 'Italic')),
      opt('oblique', localize('editor.design.style_oblique', lang, 'Oblique')),
    ],
    whiteSpace: [
      opt('', def),
      opt('normal', localize('editor.design.white_space_normal', lang, 'Normal')),
      opt('nowrap', localize('editor.design.white_space_nowrap', lang, 'No Wrap')),
      opt('pre', localize('editor.design.white_space_pre', lang, 'Pre')),
      opt('pre-wrap', localize('editor.design.white_space_pre_wrap', lang, 'Pre Wrap')),
      opt('pre-line', localize('editor.design.white_space_pre_line', lang, 'Pre Line')),
    ],
    backgroundImageType: [
      opt('none', localize('editor.design.bg_none', lang, 'None')),
      opt('upload', localize('editor.design.bg_upload', lang, 'Upload Image')),
      opt('entity', localize('editor.design.bg_entity', lang, 'Entity Image')),
      opt('url', localize('editor.design.bg_url', lang, 'Image URL')),
    ],
    backgroundSize: [
      opt('cover', 'Cover'),
      opt('contain', 'Contain'),
      opt('auto', 'Auto'),
      opt('custom', 'Custom'),
    ],
    backgroundRepeat: [
      opt('no-repeat', 'No Repeat'),
      opt('repeat', 'Repeat'),
      opt('repeat-x', 'Repeat X'),
      opt('repeat-y', 'Repeat Y'),
    ],
    backgroundPosition: [
      opt('left top', 'Left Top'),
      opt('left center', 'Left Center'),
      opt('left bottom', 'Left Bottom'),
      opt('center top', 'Center Top'),
      opt('center center', 'Center'),
      opt('center bottom', 'Center Bottom'),
      opt('right top', 'Right Top'),
      opt('right center', 'Right Center'),
      opt('right bottom', 'Right Bottom'),
    ],
    borderStyle: [
      opt('', localize('editor.design.border_style_none', lang, 'None')),
      opt('solid', localize('editor.design.border_style_solid', lang, 'Solid')),
      opt('dashed', localize('editor.design.border_style_dashed', lang, 'Dashed')),
      opt('dotted', localize('editor.design.border_style_dotted', lang, 'Dotted')),
      opt('double', localize('editor.design.border_style_double', lang, 'Double')),
    ],
    position: [
      opt('', localize('editor.design.position_default', lang, '– Default –')),
      opt('static', localize('editor.design.position_static', lang, 'Static')),
      opt('relative', localize('editor.design.position_relative', lang, 'Relative')),
      opt('absolute', localize('editor.design.position_absolute', lang, 'Absolute')),
      opt('fixed', localize('editor.design.position_fixed', lang, 'Fixed')),
      opt('sticky', localize('editor.design.position_sticky', lang, 'Sticky')),
    ],
    overflow: [
      opt('visible', 'Visible (Default)'),
      opt('hidden', 'Hidden'),
      opt('scroll', 'Scroll'),
      opt('auto', 'Auto'),
    ],
    animationType: [
      opt('none', none),
      opt('pulse', 'Pulse'),
      opt('vibrate', 'Vibrate'),
      opt('rotate-left', 'Rotate Left'),
      opt('rotate-right', 'Rotate Right'),
      opt('hover', 'Hover'),
      opt('fade', 'Fade'),
      opt('scale', 'Scale'),
      opt('bounce', 'Bounce'),
      opt('shake', 'Shake'),
      opt('tada', 'Tada'),
    ],
    animationTriggerType: [
      opt('state', 'Entity State'),
      opt('attribute', 'Entity Attribute'),
    ],
    introAnimation: [
      opt('none', none),
      opt('fadeIn', 'Fade In'),
      opt('slideInUp', 'Slide In Up'),
      opt('slideInDown', 'Slide In Down'),
      opt('slideInLeft', 'Slide In Left'),
      opt('slideInRight', 'Slide In Right'),
      opt('zoomIn', 'Zoom In'),
      opt('bounceIn', 'Bounce In'),
      opt('flipInX', 'Flip In X'),
      opt('flipInY', 'Flip In Y'),
      opt('rotateIn', 'Rotate In'),
    ],
    outroAnimation: [
      opt('none', none),
      opt('fadeOut', 'Fade Out'),
      opt('slideOutUp', 'Slide Out Up'),
      opt('slideOutDown', 'Slide Out Down'),
      opt('slideOutLeft', 'Slide Out Left'),
      opt('slideOutRight', 'Slide Out Right'),
      opt('zoomOut', 'Zoom Out'),
      opt('bounceOut', 'Bounce Out'),
      opt('flipOutX', 'Flip Out X'),
      opt('flipOutY', 'Flip Out Y'),
      opt('rotateOut', 'Rotate Out'),
    ],
    animationTiming: [
      opt('ease', localize('editor.design.ease', lang, 'Ease')),
      opt('linear', 'Linear'),
      opt('ease-in', 'Ease In'),
      opt('ease-out', 'Ease Out'),
      opt('ease-in-out', 'Ease In Out'),
      opt('cubic-bezier(0.25,0.1,0.25,1)', 'Custom Cubic'),
    ],
  } as const;
}
