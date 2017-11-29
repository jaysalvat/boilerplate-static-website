const webpack = require('webpack');
const config  = require('./gulpfile.config');

module.exports = (argv) => {
  let plugins = [
    new webpack.optimize.CommonsChunkPlugin('commons.chunk')
  ];

  if (argv.production) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin(config.uglify)
    );
  }

  return {
    devtool: argv.production ? false : 'source-map',
    output: {
      filename: '[name].bundle.js',
    },
    module: {
      loaders: [
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
