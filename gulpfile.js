/* jshint strict: false */

var del         = require('del'),
    pug         = require('pug'),
    gulp        = require('gulp'),
    yargs       = require('yargs'),
    browserSync = require('browser-sync'),
    loadplugins = require('gulp-load-plugins'),
    plugins     = loadplugins();

// Args

var argv = yargs
    .default('port',       3000)
    .default('dev',        false)
    .default('nosync',     false)
    .default('major',      false)
    .default('minor',      false)
    .default('patch',      true)
    .default('prerelease', false)
    .boolean([ 'major', 'minor', 'patch' ])
    .argv;

// Gulp

gulp.task('clean', function(next) {
    del.sync([ 'dist' ]);
    next();
});

gulp.task('bower', function() {
    return gulp.src([ 'bower_components/**/*' ])
        .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('assets', function() {
    return gulp.src([ 'src/assets/**/*.*' ])
        .pipe(gulp.dest('dist/'));
});

gulp.task('img', [ 'optimize' ], function() {
    return gulp.src([ 'src/img/**/*.*' ])
        .pipe(gulp.dest('dist/img/'));
});

gulp.task('optimize', function() {
    return gulp.src([ 'src/img/**/*.*' ])
        .pipe(plugins.imagemin({
            progressive: true,
            optimizationLevel: 7,
        }))
        .pipe(gulp.dest('src/img/'));
});

gulp.task('sass', function() {
    return gulp.src([ 'src/sass/styles.{css,scss,sass}' ])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass({
            outputStyle: argv.dev ? 'expanded' : 'compressed'
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream({ match: '**/*.css'}));
});

gulp.task('js', function() {
    gulp.src([ 'src/js/vendors/*' ])
        .pipe(gulp.dest('dist/js/vendors/'));

    return gulp.src([ 'src/js/**/*.{js,coffee}', '!src/js/vendors/*' ])
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.if(/\.coffee$/, plugins.coffee({
            sourceMap: true
        })))
        .pipe(plugins.concat('bundle.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream({ match: '**/*.js'}));
});

gulp.task('pug', function () {
    return gulp.src([ 'src/pug/**/*.pug', '!src/pug/**/_*.pug' ])
        .pipe(plugins.plumber())
        .pipe(plugins.pug({
            pug:   pug,
            locals: require('./config.json'),
            pretty:  argv.dev
        }))
        .pipe(plugins.rename(function (path) {
            if (path.basename !== 'index') {
                path.dirname  = path.dirname + '/' + path.basename;
                path.basename = 'index';
            }
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('serve', function () {
    browserSync({
        notify:    false,
        ghostMode: !argv.nosync,
        port:      argv.port,
        server: {
            baseDir: './dist'
        }
    });
});

gulp.task('reload', function () {
    return browserSync.reload();
});

gulp.task('bump', function () {
    var version = 'patch';

    if (argv.major) {
        version = 'major';
    } else if (argv.minor) {
        version = 'minor';
    } else if (argv.prerelease) {
        version = 'prerelease';
    }

    return gulp.src([ './package.json', './bower.json', ] )
        .pipe(plugins.bump({
            type: version
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('build', [ 'clean', 'bower', 'js', 'sass', 'pug', 'img', 'assets' ]);

gulp.task('watch', [ 'serve' ], function() {
    gulp.watch('bower_components/**/*',         [ 'bower',  ]);
    gulp.watch('src/img/**/*',                  [ 'img',    ]);
    gulp.watch('src/js/**/*.{js,coffee}',       [ 'js',     ]);
    gulp.watch('src/sass/**/*.{css,scss,sass}', [ 'sass',   ]);
    gulp.watch('src/pug/**/*.pug',              [ 'pug',    ]);
    gulp.watch('src/assets/**/*',               [ 'assets', ]);
});

gulp.task('default', [ 'build', 'watch' ]);

// pug Mixins

pug.filters.syntax = function (string) {
    return '<pre class="syntax-block">' + syntax(string) + '</pre>';
};

function syntax (string) {
    'use strict';

    var tabs;

    string = string
        .replace(/^(\r?\n)*/, '')
        .replace(/(\r?\n)*$/, '');

    tabs   = /^(\s*)/.exec(string)[0];
    string = string.replace(new RegExp('^' + tabs, 'gm'), '');
    string = string.trim();

    string = string
        .replace(/"(.*?)"/g,                     '{string}"$1"{/string}')
        .replace(/'(.*?)'/g,                     "{string}'$1'{/string}")
        .replace(/:(\s*)(\w*)([;\n])/g,          ":$1{string}$2{/string}$3")
        .replace(/\/\/ (.*)/g,                   "{comment}// $1{/comment}")
        .replace(/(\/\*(.*)\*\/)/g,              '{comment}$1{/comment}')
        .replace(/(<!--(.*)-->)/g,               '{comment}$1{/comment}');

    string = string
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\{string\}/g,                 '<span class="syntax-string">')
        .replace(/\{\/string\}/g,               '</span>')
        .replace(/\{comment\}/g,                '<span class="syntax-comment">')
        .replace(/\{\/comment\}/g,              '</span>');

    return string;
}

// npm i -D browser-sync
// npm i -D pug
// npm i -D gulp
// npm i -D gulp-autoprefixer
// npm i -D gulp-pug
// npm i -D gulp-load-plugins
// npm i -D gulp-plumber
// npm i -D gulp-rename
// npm i -D gulp-sass
// npm i -D gulp-coffee
// npm i -D gulp-sourcemaps
// npm i -D gulp-uglify
// npm i -D gulp-bump
