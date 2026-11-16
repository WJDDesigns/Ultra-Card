// Allow importing CSS (and other text assets) as raw strings via the `?raw`
// query. Webpack resolves these with `type: 'asset/source'`, returning the
// file contents as a string so they can be injected into a shadow root.
declare module '*.css?raw' {
  const content: string;
  export default content;
}

// Locale files split by scripts/webpack/locale-part-loader.js (issue #281).
declare module '*.json?part=runtime' {
  const content: Record<string, unknown>;
  export default content;
}
declare module '*.json?part=editor' {
  const content: Record<string, unknown>;
  export default content;
}
