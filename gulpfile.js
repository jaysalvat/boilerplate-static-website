/* jshint strict: false */

const
  load          = require('require-reload')(require),
  extend        = require('lodash.merge'),
  del           = require('del'),
  gulp          = require('gulp'),
  yargs         = require('yargs'),
  browserSync   = require('browser-sync'),
  plugins       = require('gulp-load-plugins')(),
  webpackStream = require('webpack-stream'),
  eventStream   = require('event-stream'),
  mergeStream   = require('merge-stream'),
  CacheBuster   = require('gulp-cachebust'),
  config        = require('./gulpfile.config');

const cachebuster = new CacheBuster(config.cachebuster);

// Args

const argv = yargs
  .default('port',       3000)
  .default('production', false)
  .default('nosync',     false)
  .argv;

// Gulp

gulp.task('clean', function(next) {
  del.sync([ 'dist' ]);
  next();
});

gulp.task('assets', function() {
  return gulp.src([ './src/assets/**/*.*' ])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('img', function() {
  return gulp.src([ './src/img/**/*.*' ])
    .pipe(plugins.if(argv.production, cachebuster.resources()))
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('img:optim', function () {
  gulp.src('./src/img/**/*')
    .pipe(plugins.imagemin(config.imagemin(plugins.imagemin)))
    .pipe(gulp.dest('./src/img/'));
});

gulp.task('img:optim:tinypng', function (next) {
  if (!config.tinypng.key) {
    return next();
  }

  gulp.src('./src/img/**/*.png')
    .pipe(plugins.tinypng(config.tinypng.key))
    .pipe(gulp.dest('./src/img/'));
});

gulp.task('sass', function() {
  return gulp.src([ './src/sass/styles.{css,scss,sass}' ])
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
});

gulp.task('js', function() {
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
});

gulp.task('webpack', function() {
  return gulp.src('src/js/app.js')
    .pipe(webpackStream(require('./webpack.config.js')(argv)))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream({
      match: '**/*.js'
    }));
});

gulp.task('twig', function () {
  const streams = [];
  const config = require('./config.json');
  const mixins = require('./src/views/_mixins');
  const languages = Object.keys(config.languages || {});

  languages.forEach((lang, i) => {
    let i18n, defaultI18n = {}, viewData;

    if (lang) {
      if (i === 0) {
        defaultI18n = load('./src/i18n/' + lang + '.js');
      }
      i18n = load('./src/i18n/' + lang + '.js');
      i18n = extend({}, defaultI18n, i18n);
    }

    viewData = Object.assign({}, config, { i18n, currentLang: lang });

    const stream = gulp.src([ './src/views/**/*.html', '!src/views/**/_*.html' ])
      .pipe(plugins.plumber())
      .pipe(function(es) {
        return es.map(function(file, cb) {
          let template;
          template = file.path;
          template = template.replace(file.base, '');
          template = template.replace('.html', '');
          viewData.template = template;
          return cb(null, file);
        });
      }(eventStream))
      .pipe(plugins.twig({
        base: './src/views',
        data: viewData,
        errorLogToConsole: true,
        functions: [
          { name: 'svg',
            func: mixins.svg
          },
          { name: 'markdown',
            func: mixins.markdown
          }
        ]
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
});

gulp.task('serve', function () {
  browserSync({
    notify:  false,
    ghostMode: !argv.nosync,
    port:    argv.port,
    server: {
      baseDir: './dist'
    }
  });
});

gulp.task('reload', function () {
  return browserSync.reload();
});

gulp.task('build', [ 'bundle' ], function (next) {
  if (argv.production) {
    return gulp.src([ './dist/**/*.{html,css}' ])
      .pipe(cachebuster.references())
      .pipe(plugins.htmlmin(config.htmlmin))
      .pipe(gulp.dest('./dist'));
  }
  return next();
});

gulp.task('bundle', [ 'clean', 'assets', 'img', 'sass', 'webpack', 'twig' ]);

gulp.task('watch', [ 'serve' ], function() {
  gulp.watch('./src/img/**/*',                  [ 'img',     ]);
  gulp.watch('./src/js/**/*.js',                [ 'webpack', ]);
  gulp.watch('./src/sass/**/*.{css,scss,sass}', [ 'sass',    ]);
  gulp.watch('./src/views/**/*.html',           [ 'twig',    ]);
  gulp.watch('./src/markdown/**/*.md',          [ 'twig',    ]);
  gulp.watch('./src/i18n/**/*.js',              [ 'twig',    ]);
  gulp.watch('./src/assets/**/*',               [ 'assets',  ]);
});

gulp.task('default', [ 'build', 'watch' ]);
