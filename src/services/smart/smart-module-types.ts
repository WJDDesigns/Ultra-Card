import type { SmartEntityRef } from '../uc-smart-composition-planner';
import type { SmartSanitizeContext, SmartSanitizeHass } from '../uc-smart-module-sanitizer';
import type { SmartModule } from './smart-sanitize-utils';

export type SmartModuleCategory =
  | 'data'
  | 'control'
  | 'layout'
  | 'content'
  | 'input'
  | 'media'
  | 'fx'
  | 'interactive';

export type SmartBuildContext = {
  id: string;
  entity?: SmartEntityRef | undefined;
  entities?: SmartEntityRef[] | undefined;
  prompt: string;
  style?: string | undefined;
  hass: SmartSanitizeHass;
  context: SmartSanitizeContext;
};

export type SmartSanitizeModuleContext = {
  hass: SmartSanitizeHass;
  context: SmartSanitizeContext;
  id: string;
};

export type SmartModuleSanitizeFn = (
  raw: unknown,
  ctx: SmartSanitizeModuleContext
) => SmartModule | SmartModule[] | null;

export type SmartModuleBuilderFn = (ctx: SmartBuildContext) => SmartModule | SmartModule[] | null;

export type SmartModuleProDowngradeFn = (
  raw: unknown,
  ctx: SmartSanitizeModuleContext,
  requestedType: string
) => SmartModule | SmartModule[] | null;

export type SmartModuleSpec = {
  type: string;
  title: string;
  category: SmartModuleCategory;
  tier: 'free' | 'pro';
  isContainer: boolean;
  isSmartComposable: boolean;
  entityDomains: string[];
  deviceClasses?: string[] | undefined;
  unitHints?: string[] | undefined;
  promptAliases: string[];
  promptPhrases?: RegExp[] | undefined;
  aiFields: string[];
  aiExample?: Record<string, unknown> | undefined;
  aiPurpose?: string | undefined;
  sanitize?: SmartModuleSanitizeFn | undefined;
  defaultBuilder?: SmartModuleBuilderFn | undefined;
  proDowngrade?: SmartModuleProDowngradeFn | undefined;
  proDowngradeType?: string | undefined;
};

export type SmartModuleHandlers = Partial<
  Record<
    string,
    {
      sanitize?: SmartModuleSanitizeFn;
      defaultBuilder?: SmartModuleBuilderFn;
      proDowngrade?: SmartModuleProDowngradeFn;
    }
  >
>;
