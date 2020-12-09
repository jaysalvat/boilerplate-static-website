/* jshint strict: false */

const
  load          = require('require-reload')(require),
  extend        = require('lodash.merge'),
  del           = require('del'),
  gulp          = require('gulp'),
  yargs         = require('yargs'),
  browserSync   = require('browser-sync'),
  plugins       = require('gulp-load-plugins')(),
  vinylNamed    = require('vinyl-named'),
  webpackStream = require('webpack-stream'),
  eventStream   = require('event-stream'),
  mergeStream   = require('merge-stream'),
  CacheBuster   = require('gulp-cachebust'),
  php    = require('gulp-connect-php'),
  config        = require('./gulpfile.config');

const cachebuster = new CacheBuster(config.cachebuster);

// Args

const argv = yargs
  .default('port', 3000)
  .default('port-php', 8000)
  .option('php', {
    type: 'boolean',
    default: false
  })
  .option('nosync', {
    type: 'boolean',
    default: false
  })
  .option('production', {
    type: 'boolean',
    default: false
  })
  .argv;

// Gulp

function clean(next) {
  del.sync([ 'dist' ]);
  next();
}

function assets() {
  return gulp.src([ './src/assets/**/*.*' ])
    .pipe(gulp.dest('./dist/'));
}

function img() {
  return gulp.src([ './src/img/**/*.*' ])
    .pipe(plugins.if(argv.production, cachebuster.resources()))
    .pipe(gulp.dest('./dist/img/'));
}

function imgOptim() {
  return gulp.src('./src/img/**/*')
    .pipe(plugins.imagemin(config.imagemin(plugins.imagemin)))
    .pipe(gulp.dest('./src/img/'));
}

function imgOptimTinyPNG() {
  if (!config.tinypng.key) {
    throw 'TinyPNG API Key missing';
  }

  return gulp.src('./src/img/**/*.png')
    .pipe(plugins.tinypng(config.tinypng.key))
    .pipe(gulp.dest('./src/img/'));
}

function sass() {
  return gulp.src([ './src/sass/styles*.{css,scss,sass}' ])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      outputStyle: argv.production ? 'compressed' : 'expanded'
    }).on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer(config.autoprefixer))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream({
      match: '**/*.css'
    }));
}

function js() {
  gulp.src([ './src/js/vendors/*' ])
    .pipe(gulp.dest('./dist/js/vendors/'));

  return gulp.src([ './src/js/**/*.js', '!src/js/vendors/*' ])
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('bundle.js'))
    .pipe(plugins.if(argv.production, plugins.uglify(config.uglify)))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream({
      match: '**/*.js'
    }));
}

function webpack() {
  return gulp.src('src/js/app*.js')
    .pipe(vinylNamed())
    .pipe(
      webpackStream(require('./webpack.config.js')(argv))
        .on('error', function handleError() {
          this.emit('end');
        })
    )
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream({
      match: '**/*.js'
    }));
}

function twig() {
  const streams = [];
  const config = require('./config.json');
  const mixins = require('./src/views/_mixins');
  const languages = Object.keys(config.languages || {});
  const defaultI18n = load('./src/i18n/' + languages[0] + '.js');
  const mixinFunctions = [];

  Object.keys(mixins).forEach((key) => {
    mixinFunctions.push({
      name: key,
      func: mixins[key]
    });
  });

  languages.forEach((lang) => {
    let i18n, viewData;

    if (lang) {
      i18n = load('./src/i18n/' + lang + '.js');
      i18n = extend({}, defaultI18n, i18n);
    }

    viewData = Object.assign({}, config, { i18n, currentLang: lang });

    const stream = gulp.src([ './src/views/**/*.{html,php}', '!src/views/**/_*.{html,php}' ])
      .pipe(plugins.plumber())
      .pipe(function(es) {
        return es.map(function(file, cb) {
          let template;
          template = file.path;
          template = template.replace(file.base, '');
          template = template.replace('.html', '');
          viewData.template = template;
          viewData.currentPath = template.replace(/\/index$/, '');
          return cb(null, file);
        });
      }(eventStream))
      .pipe(plugins.twig({
        base: './src/views',
        data: viewData,
        errorLogToConsole: true,
        extname: true,
        functions: mixinFunctions
      }))
      .pipe(plugins.rename(function (path) {
        if (path.basename !== 'index') {
          path.dirname  = path.dirname + '/' + path.basename;
          path.basename = 'index';
        }
      }))
      .pipe(gulp.dest('./dist/' + config.languages[lang].dir));

    streams.push(stream);
  });

  return mergeStream.apply(this, streams)
    .pipe(browserSync.stream({
      match: '**/*.html'
    }));
}

function serve() {
  browserSync({
    notify:  false,
    ghostMode: !argv.nosync,
    port:    argv.port,
    server: {
      baseDir: './dist'
    }
  });
}

function build(next) {
  if (argv.production) {
    return gulp.src([ './dist/**/*.{html,css}' ])
      .pipe(plugins.if(argv.production, cachebuster.references()))
      .pipe(plugins.htmlmin(config.htmlmin))
      .pipe(gulp.dest('./dist'));
  }
  return next();
}

function watch(next) {
  if (argv.php) {
    php.server({
      base:'./dist',
      port: argv['port-php'],
      keepalive: true,
      stdio: 'ignore',
    }, function (){
      browserSync({
        proxy: 'http://localhost:' + argv['port-php'],
        notify: false,
        ghostMode: !argv.nosync,
        port: argv.port,
        open: true,
      });
    });
  } else {
    browserSync({
      notify: false,
      ghostMode: !argv.nosync,
      port: argv.port,
      server: {
        baseDir: './dist'
      }
    });
  }

  gulp.watch('./src/img/**/*',                   gulp.series(img     ));
  gulp.watch('./src/js/**/*.js',                 gulp.series(webpack ));
  gulp.watch('./src/sass/**/*.{css,scss,sass}',  gulp.series(sass    ));
  gulp.watch('./src/views/**/*.{html,php}',      gulp.series(twig    ));
  gulp.watch('./src/markdown/**/*.md',           gulp.series(twig    ));
  gulp.watch('./src/i18n/**/*.js',               gulp.series(twig    ));
  gulp.watch('./src/assets/**/*',                gulp.series(assets  ));
  return next();
}

const bundle = gulp.series(clean, assets, img, sass, webpack, twig);

exports.assets = assets;
exports.js = js;
exports.img = img;
exports.imgOptim = imgOptim;
exports.imgOptimTinyPNG = imgOptimTinyPNG;
exports.default = gulp.series(bundle, build, watch);
exports.build = gulp.series(bundle, build);
exports.watch = gulp.series(serve, watch);
