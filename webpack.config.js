const config  = require('./gulpfile.config');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (argv) => {
  const settings = {
    devtool: argv.production ? false : 'source-map',
    mode: argv.production ? 'production' : 'development',
    optimization: {
      minimizer: [],
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        minRemainingSize: 0,
        maxSize: 100000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    },
    output: {
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader?harmony',
            options: {}
          }
        }
      ]
    }
  };

  if (argv.production) {
    settings.optimization.minimizer.push(new TerserPlugin());
  }

  return settings;
};
