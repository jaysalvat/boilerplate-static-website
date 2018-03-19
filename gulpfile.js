/* jshint strict: false */

const
  del           = require('del'),
  gulp          = require('gulp'),
  yargs         = require('yargs'),
  browserSync   = require('browser-sync'),
  webpackStream = require('webpack-stream'),
  plugins       = require('gulp-load-plugins')(),
  config        = require('./gulpfile.config');

// Args

var argv = yargs
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
    .pipe(plugins.if(argv.production, plugins.imagemin(config.imagemin(plugins.imagemin))))
    .pipe(gulp.dest('./dist/img/'));
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
  let data = require('./config.json');
  let mixins = require('./src/views/_mixins');

  return gulp.src([ './src/views/**/*.html', '!src/views/**/_*.html' ])
    .pipe(plugins.plumber())
    .pipe(plugins.twig({
      base: './src/views',
      data: data,
      errorLogToConsole: true,
      functions: [
        {
          name: 'svg',
          func: mixins.svg
        },
        {
          name: 'markdown',
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
    .pipe(plugins.if(argv.production, plugins.htmlmin(config.htmlmin)))
    .pipe(gulp.dest('./dist'))
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

gulp.task('build', [ 'clean', 'img', 'assets', 'twig', 'sass', 'webpack' ]);

gulp.task('watch', [ 'serve' ], function() {
  gulp.watch('./src/img/**/*',                  [ 'img',   ]);
  gulp.watch('./src/js/**/*.js',                [ 'webpack', ]);
  gulp.watch('./src/sass/**/*.{css,scss,sass}', [ 'sass',  ]);
  gulp.watch('./src/views/**/*.html',           [ 'twig',  ]);
  gulp.watch('./src/markdown/**/*.md',          [ 'twig',  ]);
  gulp.watch('./src/assets/**/*',               [ 'assets',  ]);
});

gulp.task('default', [ 'build', 'watch' ]);
