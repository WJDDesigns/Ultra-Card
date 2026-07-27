import type { HomeAssistant } from 'custom-card-helpers';
import type { UltraCardConfig, CardModule, CardRow, CardColumn } from '../types';
import { configValidationService } from './config-validation-service';
import { entityDetector } from './uc-entity-detector';
import { getModuleRegistry } from '../modules/module-registry';
import { ucCloudAuthService } from './uc-cloud-auth-service';
import { getConnectInfo, MIN_CONNECT_VERSION } from './uc-connect-compatibility';
import { localize } from '../localize/localize';

export type HealthSeverity = 'error' | 'warning' | 'info';

export interface HealthJumpTarget {
  rowIndex?: number;
  columnIndex?: number;
  moduleIndex?: number;
  moduleId?: string;
  entityId?: string;
}

export interface HealthIssue {
  id: string;
  severity: HealthSeverity;
  category: 'validation' | 'entity' | 'module' | 'load' | 'connect';
  message: string;
  jump?: HealthJumpTarget;
  fixAction?: 'open_connect';
}

export interface CardHealthReport {
  issues: HealthIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

function walkModules(
  config: UltraCardConfig,
  visitor: (
    module: CardModule,
    loc: { rowIndex: number; columnIndex: number; moduleIndex: number; path: string }
  ) => void
): void {
  const rows = config?.layout?.rows;
  if (!Array.isArray(rows)) return;

  const visitList = (
    modules: CardModule[] | undefined,
    rowIndex: number,
    columnIndex: number,
    pathPrefix: string
  ) => {
    if (!Array.isArray(modules)) return;
    modules.forEach((module, moduleIndex) => {
      const path = `${pathPrefix}.modules[${moduleIndex}]`;
      visitor(module, { rowIndex, columnIndex, moduleIndex, path });
      const nested = (module as any).modules as CardModule[] | undefined;
      if (Array.isArray(nested)) {
        visitList(nested, rowIndex, columnIndex, path);
      }
      const sections = (module as any).sections as Array<{ modules?: CardModule[] }> | undefined;
      if (Array.isArray(sections)) {
        sections.forEach((section, si) => {
          visitList(section.modules, rowIndex, columnIndex, `${path}.sections[${si}]`);
        });
      }
    });
  };

  rows.forEach((row: CardRow, rowIndex) => {
    (row.columns || []).forEach((column: CardColumn, columnIndex) => {
      visitList(column.modules, rowIndex, columnIndex, `rows[${rowIndex}].columns[${columnIndex}]`);
    });
  });
}

/**
 * Read-only card health analysis: validation errors, missing/unavailable entities,
 * unknown modules, and module load failures. Does not mutate config.
 */
class UcCardHealthService {
  async analyze(config: UltraCardConfig, hass?: HomeAssistant | null): Promise<CardHealthReport> {
    const issues: HealthIssue[] = [];
    const registry = getModuleRegistry();

    // Config validation (errors only — warnings are lower priority)
    try {
      const validation = await configValidationService.validateAndCorrectConfig(config);
      validation.errors.forEach((message, i) => {
        issues.push({
          id: `validation-error-${i}`,
          severity: 'error',
          category: 'validation',
          message,
        });
      });
      validation.warnings.forEach((message, i) => {
        issues.push({
          id: `validation-warn-${i}`,
          severity: 'warning',
          category: 'validation',
          message,
        });
      });
    } catch (err) {
      issues.push({
        id: 'validation-failed',
        severity: 'error',
        category: 'validation',
        message: err instanceof Error ? err.message : 'Config validation failed',
      });
    }

    // Unknown modules + load errors
    walkModules(config, (module, loc) => {
      const type = module?.type;
      if (!type) {
        issues.push({
          id: `module-missing-type-${loc.path}`,
          severity: 'error',
          category: 'module',
          message: `Module at ${loc.path} is missing a type`,
          jump: {
            rowIndex: loc.rowIndex,
            columnIndex: loc.columnIndex,
            moduleIndex: loc.moduleIndex,
            moduleId: (module as any)?.id,
          },
        });
        return;
      }

      const meta = registry.getModuleMetadata(type);
      if (!meta) {
        issues.push({
          id: `unknown-module-${loc.path}`,
          severity: 'error',
          category: 'module',
          message: `Unknown module type "${type}" at ${loc.path}`,
          jump: {
            rowIndex: loc.rowIndex,
            columnIndex: loc.columnIndex,
            moduleIndex: loc.moduleIndex,
            moduleId: (module as any)?.id,
          },
        });
      }

      const loadError = registry.getModuleLoadError(type);
      if (loadError) {
        issues.push({
          id: `load-error-${type}-${loc.path}`,
          severity: 'error',
          category: 'load',
          message: `Module "${type}" failed to load: ${loadError.message}`,
          jump: {
            rowIndex: loc.rowIndex,
            columnIndex: loc.columnIndex,
            moduleIndex: loc.moduleIndex,
            moduleId: (module as any)?.id,
          },
        });
      }
    });

    // Missing / unavailable entities
    if (config?.layout) {
      const refs = entityDetector.scanLayout(config.layout);
      const seen = new Set<string>();
      for (const ref of refs) {
        const entityId = ref.entityId;
        if (!entityId || seen.has(entityId)) continue;
        // Skip template/variable placeholders
        if (entityId.startsWith('$') || entityId.includes('{{')) continue;
        seen.add(entityId);

        if (!hass?.states) {
          continue;
        }

        const state = hass.states[entityId];
        if (!state) {
          issues.push({
            id: `missing-entity-${entityId}`,
            severity: 'error',
            category: 'entity',
            message: `Missing entity: ${entityId}`,
            jump: { entityId },
          });
        } else if (state.state === 'unavailable') {
          issues.push({
            id: `unavailable-entity-${entityId}`,
            severity: 'warning',
            category: 'entity',
            message: `Unavailable entity: ${entityId}`,
            jump: { entityId },
          });
        } else if (state.state === 'unknown') {
          issues.push({
            id: `unknown-entity-${entityId}`,
            severity: 'info',
            category: 'entity',
            message: `Entity state is unknown: ${entityId}`,
            jump: { entityId },
          });
        }
      }
    }

    // Ultra Card Connect (info/warning only — Hub/Pro features may still work offline)
    if (hass) {
      try {
        const lang = (hass as any)?.locale?.language || 'en';
        const installed = ucCloudAuthService.isIntegrationInstalled(hass);
        if (!installed) {
          issues.push({
            id: 'connect-not-installed',
            severity: 'info',
            category: 'connect',
            message: localize(
              'editor.health.connect_not_installed',
              lang,
              'Ultra Card Connect is not installed. Hub sidebar and Pro sync require the integration.'
            ),
            fixAction: 'open_connect',
          });
        } else {
          const connectInfo = getConnectInfo(hass);
          if (connectInfo.outdated) {
            const current = connectInfo.integrationVersion || 'unknown';
            issues.push({
              id: 'connect-needs-update',
              severity: 'warning',
              category: 'connect',
              message: localize(
                'editor.health.connect_needs_update',
                lang,
                'Ultra Card Connect needs updating (installed {current}, required {required}+). Update the integration so Smart Cards, media upload, and Pro sync work reliably.'
              )
                .replace('{current}', current)
                .replace('{required}', MIN_CONNECT_VERSION),
              fixAction: 'open_connect',
            });
          }

          const user = ucCloudAuthService.checkIntegrationAuth(hass);
          const sensor = (hass as any).states?.['sensor.ultra_card_pro_cloud_authentication_status'];
          if (!user) {
            const needsReauth = !!sensor?.attributes?.needs_reauth;
            issues.push({
              id: needsReauth ? 'connect-needs-reauth' : 'connect-not-authenticated',
              severity: 'warning',
              category: 'connect',
              message: needsReauth
                ? localize(
                    'editor.health.connect_needs_reauth',
                    lang,
                    'Ultra Card Connect needs re-authentication. Open the Hub Account tab to sign in again.'
                  )
                : localize(
                    'editor.health.connect_not_authenticated',
                    lang,
                    'Ultra Card Connect is installed but not signed in. Open the Hub Account tab to connect.'
                  ),
              fixAction: 'open_connect',
            });
          }
        }
      } catch {
        /* never fail health analysis on Connect checks */
      }
    }

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    return { issues, errorCount, warningCount, infoCount };
  }
}

export const ucCardHealthService = new UcCardHealthService();
