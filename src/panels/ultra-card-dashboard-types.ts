/** Shared Hub tab/group types (avoids circular imports). */
export type HubTab =
  | 'dashboard'
  | 'account'
  | 'favorites'
  | 'presets'
  | 'colors'
  | 'variables'
  | 'templates'
  | 'docs'
  | 'pro'
  | 'about';

export type HubGroup = 'home' | 'library' | 'account' | 'help';

export interface HubGroupDef {
  key: HubGroup;
  labelKey: string;
  icon: string;
  tabs: HubTab[];
}

export interface HubTabDef {
  key: HubTab;
  labelKey: string;
  icon: string;
  group: HubGroup;
}
