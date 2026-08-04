/**
 * Standalone build for the ultracard.io module-directory demo bundle.
 * Does NOT touch the normal ultra-card.js build.
 *
 *   npx webpack -c webpack.demo.config.js
 *   → dist-demo/ultra-card-demo.js
 */
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

function getVersion() {
  try {
    const v = fs.readFileSync(path.resolve(__dirname, 'src/version.ts'), 'utf8');
    const m = v.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (m) return m[1];
  } catch (e) {}
  return 'unknown';
}

module.exports = {
  mode: 'production',
  entry: { 'ultra-card-demo': './src/website-demo/ucm-demo-entry.ts' },
  devtool: false,
  module: {
    parser: { javascript: { dynamicImportMode: 'eager' } },
    rules: [
      {
        test: /\.tsx?$/,
        use: { loader: 'ts-loader', options: { transpileOnly: true } },
        exclude: /node_modules/,
      },
      { test: /\.css$/, resourceQuery: /raw/, type: 'asset/source' },
      { test: /\.css$/, resourceQuery: { not: [/raw/] }, use: ['style-loader', 'css-loader'] },
    ],
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist-demo'),
    chunkFilename: 'ucd-[name].js',
  },
  performance: { hints: false },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.VERSION': JSON.stringify(getVersion()),
    }),
  ],
};
