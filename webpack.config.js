const webpack = require('webpack');
const config  = require('./gulpfile.config');

module.exports = (argv) => {
  let plugins = [
  ];

  if (argv.production) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(config.uglify)
    );
  }

  return {
    devtool: argv.production ? false : 'source-map',
    mode: argv.production ? 'production' : 'development',
    optimization: {
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
          options: {
            presets: [ 'latest' ]
          }
        }
      ]
    },
    plugins: plugins
  };
};
