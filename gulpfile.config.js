module.exports = {

  // https://tinypng.com/

  tinypng: {
    key: ''
  },

  // https://www.npmjs.com/package/gulp-cachebust

  cachebuster: {
    checksumLength: 16,
    random: false,
    pathFormatter: function(dirname, basename, extname, checksum) {
      return require('path').join(dirname, checksum + extname);
    }
  },

  // https://github.com/kangax/html-minifier

  htmlmin: {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJs: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
  },

  // https://github.com/mishoo/UglifyJS2#minify-options

  uglify: {
    sourceMap: true
  },

  // https://github.com/postcss/autoprefixer#options

  autoprefixer: {
    cascade: true
  },

  // https://github.com/sindresorhus/gulp-imagemin

  imagemin: function (imagemin) {
    return [
      // https://github.com/imagemin/imagemin-gifsicle

      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3,
        colors: 256
      }),

      // https://github.com/imagemin/imagemin-jpegtran

      imagemin.jpegtran({
        progressive: true,
        arithmetic: false
      }),

      // https://github.com/imagemin/imagemin-optipng

      imagemin.optipng({
        optimizationLevel: 5,
        colorTypeReduction: true,
        paletteReduction: true,
        bitDepthReduction: true
      }),

      // https://github.com/svg/svgo

      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false },
          { removeComments: true },
          { removeDoctype: true },
          { cleanupAttrs: true },
          { removeTitle: true },
          { removeDesc: true },
          { minifyStyles: true }
        ]
      })
    ];
  }
};
