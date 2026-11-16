/**
 * Webpack loader for `src/translations/<lang>.json?part=runtime|editor`.
 * Emits only the keys of that part (see scripts/lib/locale-split.js), so each
 * language becomes a small runtime chunk every dashboard loads and a larger
 * editor chunk loaded only with the editor or the Hub panel (issue #281).
 */
const { pickPart } = require('../lib/locale-split');

module.exports = function localePartLoader(source) {
  const params = new URLSearchParams((this.resourceQuery || '').replace(/^\?/, ''));
  const part = params.get('part');
  if (part !== 'runtime' && part !== 'editor') {
    throw new Error(`locale-part-loader: unknown part "${part}" for ${this.resourcePath}`);
  }
  const dict = JSON.parse(source);
  return `export default ${JSON.stringify(pickPart(dict, part))};`;
};
