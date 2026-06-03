// Allow importing CSS (and other text assets) as raw strings via the `?raw`
// query. Webpack resolves these with `type: 'asset/source'`, returning the
// file contents as a string so they can be injected into a shadow root.
declare module '*.css?raw' {
  const content: string;
  export default content;
}
