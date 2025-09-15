const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
    entry: './src/index.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: `ultra-card.js`,
      path: path.resolve(__dirname, 'dist'),
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
    ],
    performance: {
      hints: false,
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
