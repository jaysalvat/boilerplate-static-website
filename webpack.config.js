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
        minSize: 30000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
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
          loader: 'babel-loader?harmony',
          options: {}
        }
      ]
    }
  };

  if (argv.production) {
    settings.optimization.minimizer.push(new TerserPlugin());
  }

  return settings;
};
