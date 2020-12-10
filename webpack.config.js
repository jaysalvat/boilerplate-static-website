const config  = require('./gulpfile.config');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (argv) => {
  const settings = {
    devtool: argv.production ? false : 'source-map',
    mode: argv.production ? 'production' : 'development',
    optimization: {
      minimizer: []
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
