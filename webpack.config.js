const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const fs = require('fs');
const webpack = require('webpack');

// Extract version from version.ts file
function getVersion() {
  try {
    const versionFile = fs.readFileSync(path.resolve(__dirname, 'src/version.ts'), 'utf8');
    const versionMatch = versionFile.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (versionMatch && versionMatch[1]) {
      return versionMatch[1];
    }
  } catch (e) {
    console.error('Error reading version:', e);
  }
  return 'unknown';
}

const version = getVersion();
console.log(`Building Ultra Card version: ${version}`);

// Generate the version.js file with the extracted version
function generateVersionJs() {
  const content = `/**
 * Ultra Card Version
 * v${version}
 * 
 * This file is auto-generated from src/version.ts
 * DO NOT MODIFY DIRECTLY
 */

let version = "undefined";

function setVersion(value) {
  version = value;
}

// Set default version (will be overridden by card)
setVersion('${version}');

export { version, setVersion };`;

  fs.writeFileSync(path.resolve(__dirname, 'dist/version.js'), content);
  console.log(`Generated version.js with version ${version}`);
}

// Generate the version file before webpack starts
generateVersionJs();

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  // SINGLE_FILE=1 restores the pre-3.10 self-contained bundle (emergency hotfix path).
  const singleFile = process.env.SINGLE_FILE === '1';

  return {
    devtool: isProduction ? 'hidden-source-map' : 'eval-source-map',
    // Native ESM output. HA loads Lovelace resources via dynamic import(), so
    // there is no <script> tag; only import.meta.url can locate sibling chunks.
    // See docs/bundle-strategy.md for the HACS distribution facts.
    target: ['web', 'es2020'],
    experiments: { outputModule: true },
    entry: {
      'ultra-card': './src/index.ts',
      'ultra-card-panel': './src/panels/ultra-card-dashboard.ts',
    },
    module: {
      parser: {
        javascript: {
          dynamicImportMode: singleFile ? 'eager' : 'lazy',
        },
      },
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: { transpileOnly: true },
          },
          exclude: /node_modules/,
        },
        {
          // Raw CSS imports (e.g. `import css from 'leaflet/dist/leaflet.css?raw'`)
          // are inlined as a string so they can be injected into a shadow root.
          test: /\.css$/,
          resourceQuery: /raw/,
          type: 'asset/source',
        },
        {
          test: /\.css$/,
          resourceQuery: { not: [/raw/] },
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      // Entry files keep fixed names (HACS busts them with ?hacstag=). Chunks
      // have no hacstag and /hacsfiles/ is served with a 31-day cache, so the
      // content hash is what makes updates take effect.
      chunkFilename: 'uc-[name].[contenthash:8].js',
      module: true,
      library: { type: 'module' },
      chunkFormat: 'module',
      chunkLoading: 'import',
      workerChunkLoading: 'import',
      // Resolved from import.meta.url at runtime; src/public-path.ts pins it explicitly.
      publicPath: 'auto',
      clean: {
        keep: /^(assets\/|bundle-report\.html|version\.js|version\.d\.ts)/,
      },
    },
    optimization: {
      usedExports: true,
      splitChunks: {
        // Only async chunks are split; the two entries stay self-contained.
        chunks: 'async',
        // Shared code smaller than this is duplicated into the requesting
        // chunks instead of becoming yet another request (HA serves over
        // HTTP/1.1, so request count matters more than a few duplicated KB).
        minSize: 40 * 1024,
        cacheGroups: {
          // Readable names for the heavy vendors so a missing file in
          // www/community/Ultra-Card/ is diagnosable at a glance.
          three: { test: /[\\/]node_modules[\\/]three[\\/]/, name: 'vendor-three', priority: 30 },
          tiptap: {
            test: /[\\/]node_modules[\\/](@tiptap|prosemirror-[a-z-]+|linkifyjs)[\\/]/,
            name: 'vendor-tiptap',
            priority: 30,
          },
          codemirror: {
            test: /[\\/]node_modules[\\/](@codemirror|@lezer|style-mod|w3c-keyname|crelt)[\\/]/,
            name: 'vendor-codemirror',
            priority: 30,
          },
          leaflet: { test: /[\\/]node_modules[\\/]leaflet[\\/]/, name: 'vendor-leaflet', priority: 30 },
          swiper: { test: /[\\/]node_modules[\\/]swiper[\\/]/, name: 'vendor-swiper', priority: 30 },
          pako: { test: /[\\/]node_modules[\\/]pako[\\/]/, name: 'vendor-pako', priority: 30 },
          // Everything else keeps webpack's default vendor/shared behaviour
          // (per usage-combination chunks, hashed ids), gated by minSize above.
        },
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'dist/assets'),
            noErrorOnMissing: true,
            globOptions: { ignore: ['**/.DS_Store'] },
          },
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'assets'),
            noErrorOnMissing: true,
            globOptions: { ignore: ['**/.DS_Store'] },
          },
          // Copy individual assets to root for HACS serving
          {
            from: path.resolve(__dirname, 'src/assets/Ultra.jpg'),
            to: path.resolve(__dirname, 'Ultra.jpg'),
            noErrorOnMissing: true,
          },
        ],
      }),
      // Define environment variables
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.VERSION': JSON.stringify(version),
      }),
      // Generate a debug info file that contains version info
      {
        apply: compiler => {
          compiler.hooks.afterEmit.tap('GenerateVersionInfo', () => {
            // Create a debug info file
            const debugContent = `// Ultra Card Debug Info
// Version: ${version}
// Build Date: ${new Date().toISOString()}
// Build Mode: ${isProduction ? 'production' : 'development'}
`;

            fs.writeFileSync(path.resolve(__dirname, 'dist/debug-info.js'), debugContent);

            console.log(`Created debug info file for version ${version}`);
          });
        },
      },
      // Auto-deploy to Home Assistant on build (for development). Skipped when SKIP_HA_DEPLOY=1 (e.g. build:deploy uses deploy.js instead).
      {
        apply: compiler => {
          compiler.hooks.afterEmit.tap('AutoDeployToHA', () => {
            if (process.env.SKIP_HA_DEPLOY === '1') {
              return;
            }
            const haDeployPath =
              process.env.HA_DEPLOY_PATH || '/Volumes/config/www/community/Ultra-Card';
            const panelIntegrationPath =
              process.env.HA_PANEL_DEPLOY_PATH ||
              '/Volumes/config/custom_components/ultra_card_pro_cloud/www';
            const sourceFile = path.resolve(__dirname, 'dist/ultra-card.js');
            const targetFile = path.join(haDeployPath, 'ultra-card.js');

            // Only deploy if the HA config directory exists (volume is mounted)
            if (fs.existsSync(haDeployPath)) {
              try {
                fs.copyFileSync(sourceFile, targetFile);

                // Also copy the license file if it exists
                const licenseSource = path.resolve(__dirname, 'dist/ultra-card.js.LICENSE.txt');
                if (fs.existsSync(licenseSource)) {
                  fs.copyFileSync(
                    licenseSource,
                    path.join(haDeployPath, 'ultra-card.js.LICENSE.txt')
                  );
                }

                // Copy panel bundle for Ultra Card Hub
                const panelSource = path.resolve(__dirname, 'dist/ultra-card-panel.js');
                if (fs.existsSync(panelSource)) {
                  fs.copyFileSync(panelSource, path.join(haDeployPath, 'ultra-card-panel.js'));
                }
                const panelLicense = path.resolve(__dirname, 'dist/ultra-card-panel.js.LICENSE.txt');
                if (fs.existsSync(panelLicense)) {
                  fs.copyFileSync(panelLicense, path.join(haDeployPath, 'ultra-card-panel.js.LICENSE.txt'));
                }

                // Copy assets folder if it exists
                const assetsSource = path.resolve(__dirname, 'dist/assets');
                const assetsTarget = path.join(haDeployPath, 'assets');
                if (fs.existsSync(assetsSource)) {
                  if (!fs.existsSync(assetsTarget)) {
                    fs.mkdirSync(assetsTarget, { recursive: true });
                  }
                  const assetFiles = fs.readdirSync(assetsSource);
                  assetFiles.forEach(file => {
                    // Skip .DS_Store and other hidden files
                    if (file.startsWith('.')) return;
                    try {
                      fs.copyFileSync(path.join(assetsSource, file), path.join(assetsTarget, file));
                    } catch (e) {
                      // Ignore individual file copy errors
                    }
                  });
                }

                // Copy emitted lazy chunks so manifest-first module loaders can resolve in HA.
                // Prune stale hashed chunks first so the HA folder mirrors dist/.
                const distRootFiles = fs.readdirSync(path.resolve(__dirname, 'dist'));
                const isChunkFile = file =>
                  file.startsWith('uc-') && (file.endsWith('.js') || file.endsWith('.js.LICENSE.txt'));
                const pruneStaleChunks = dir => {
                  const current = new Set(distRootFiles.filter(isChunkFile));
                  for (const name of fs.readdirSync(dir)) {
                    if (isChunkFile(name) && !current.has(name)) {
                      try {
                        fs.unlinkSync(path.join(dir, name));
                      } catch (e) {
                        // ignore
                      }
                    }
                  }
                };
                pruneStaleChunks(haDeployPath);
                if (fs.existsSync(panelIntegrationPath)) pruneStaleChunks(panelIntegrationPath);
                distRootFiles
                  .filter(
                    file =>
                      file.startsWith('uc-') && (file.endsWith('.js') || file.endsWith('.js.LICENSE.txt'))
                  )
                  .forEach(file => {
                    fs.copyFileSync(
                      path.resolve(__dirname, 'dist', file),
                      path.join(haDeployPath, file)
                    );
                  });

                if (fs.existsSync(panelIntegrationPath)) {
                  if (fs.existsSync(panelSource)) {
                    fs.copyFileSync(panelSource, path.join(panelIntegrationPath, 'ultra-card-panel.js'));
                  }
                  if (fs.existsSync(panelLicense)) {
                    fs.copyFileSync(
                      panelLicense,
                      path.join(panelIntegrationPath, 'ultra-card-panel.js.LICENSE.txt')
                    );
                  }
                  distRootFiles
                    .filter(
                      file =>
                        file.startsWith('uc-') && (file.endsWith('.js') || file.endsWith('.js.LICENSE.txt'))
                    )
                    .forEach(file => {
                      fs.copyFileSync(
                        path.resolve(__dirname, 'dist', file),
                        path.join(panelIntegrationPath, file)
                      );
                    });
                }

                console.log(`\x1b[32m✓ Auto-deployed to HA: ${haDeployPath}\x1b[0m`);
                console.log(
                  `\x1b[36m  Refresh browser (F5) to see changes - no HA restart needed!\x1b[0m`
                );
              } catch (err) {
                console.log(`\x1b[33m⚠ Could not auto-deploy: ${err.message}\x1b[0m`);
              }
            } else {
              console.log(
                `\x1b[90m  HA deploy path not found (${haDeployPath}) - skipping auto-deploy\x1b[0m`
              );
            }
          });
        },
      },
      ...(process.env.ANALYZE ? [new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false, reportFilename: 'bundle-report.html' })] : []),
    ],
    performance: {
      // Matches the threshold in .github/workflows/ci.yml ("Bundle size check").
      // The single-file HACS build is legitimately large (see docs/bundle-strategy.md),
      // so a 2MB budget fired on every build and trained everyone to ignore it.
      // Keep this in sync with CI so a warning means an actual regression.
      hints: isProduction ? 'warning' : false,
      maxAssetSize: 16 * 1024 * 1024,
      maxEntrypointSize: 16 * 1024 * 1024,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 8080,
      hot: true,
      open: true,
    },
  };
};
