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

  return {
    entry: {
      'ultra-card': './src/index.ts',
      'ultra-card-panel': './src/panels/ultra-card-dashboard.ts',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
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
      chunkFilename: 'uc-[name].js',
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'dist/assets'),
            noErrorOnMissing: true,
          },
          {
            from: path.resolve(__dirname, 'src/assets'),
            to: path.resolve(__dirname, 'assets'),
            noErrorOnMissing: true,
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
      // Auto-deploy to Home Assistant on build (for development)
      {
        apply: compiler => {
          compiler.hooks.afterEmit.tap('AutoDeployToHA', () => {
            const haDeployPath =
              process.env.HA_DEPLOY_PATH || '/Volumes/config/www/community/Ultra-Card';
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
      hints: isProduction ? 'warning' : false,
      maxAssetSize: 2 * 1024 * 1024, // 2MB - catch bundle regressions
      maxEntrypointSize: 2 * 1024 * 1024,
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
