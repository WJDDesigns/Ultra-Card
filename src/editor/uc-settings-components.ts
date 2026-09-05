/**
 * Form controls that module settings tabs render (`renderColorField`,
 * `renderSegmentedField`, the action editor's navigation picker, ...).
 *
 * They used to be side-effect imports in base-module.ts, which put every one of
 * them in `ultra-card.js` for dashboards that never open an editor. Settings
 * tabs only ever render inside the editor, so the editor chunk defines them.
 * Modules that show one of these controls in a *preview* (color input, gauge
 * gradient) still import the component themselves.
 */
import '../components/ultra-color-picker';
import '../components/ultra-file-picker';
import '../components/ultra-chip-list';
import '../components/ultra-segmented';
import '../components/ultra-icon-field';
import '../components/navigation-picker';
import '../components/uc-gradient-editor';
