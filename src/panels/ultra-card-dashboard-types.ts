/** Shared Hub tab types (avoids circular imports). */
export type HubTab =
  | 'dashboard'
  | 'account'
  | 'favorites'
  | 'presets'
  | 'colors'
  | 'variables'
  | 'templates'
  | 'docs';

export interface HubTabDef {
  key: HubTab;
  labelKey: string;
  icon: string;
}
