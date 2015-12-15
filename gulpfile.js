var jade        = require('jade'),
    gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    del         = require('del'),
    loadplugins = require('gulp-load-plugins'),
    yargs       = require('yargs'),
    plugins     = loadplugins();

// Args

var argv = yargs
    .default('port',   3000)
    .default('dev',    false)
    .default('nosync', false)
    .argv;

// Gulp

gulp.task('delete', function(next) {
    del.sync([ 'dist' ]);
    next();
});

gulp.task('bower', function() {
    return gulp.src([ 'bower_components/**/*.*' ])
        .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('assets', function() {
    return gulp.src([ 'src/assets/**/*.*' ])
        .pipe(gulp.dest('dist/'));
});

gulp.task('img', function() {
    return gulp.src([ 'src/img/**/*.*' ])
        .pipe(gulp.dest('dist/img/'));
});

gulp.task('sass', function() {
    return gulp.src([ 'src/sass/styles.scss' ])
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass({
            outputStyle: argv.dev ? 'expanded' : 'compressed'
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function() {
    gulp.src([ 'src/js/**' ] )
        .pipe(gulp.dest('dist/js'));

    return gulp.src([ 'src/js/app.js' ] )
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('coffee', function() {
    return gulp.src([ 'src/coffee/**/*.coffee' ] )
        .pipe(plugins.plumber())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.coffee({
            sourceMap: true
        }))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('jade', function () {
    return gulp.src([ 'src/jade/**/*.jade', '!src/jade/**/_*.jade' ])
        .pipe(plugins.plumber())
        .pipe(plugins.jade({
            jade:   jade,
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

gulp.task('build', [ 'delete', 'bower', 'js', 'coffee', 'sass', 'jade', 'img', 'assets' ]);

gulp.task('watch', [ 'serve' ], function() {
    gulp.watch('bower/**/*',             [ 'bower',  ]);
    gulp.watch('src/img/**/*',           [ 'img',    ]);
    gulp.watch('src/js/**/*.js',         [ 'js',     ]);
    gulp.watch('src/coffee/**/*.coffee', [ 'coffee', ]);
    gulp.watch('src/sass/**/*.scss',     [ 'sass',   ]);
    gulp.watch('src/jade/**/*.jade',     [ 'jade',   ]);
    gulp.watch('src/assets/**/*',        [ 'assets', ]);
});

gulp.task('default', [ 'build', 'watch' ]);

// Jade Mixins

jade.filters.syntax = function (string) {
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
// npm i -D jade
// npm i -D gulp
// npm i -D gulp-autoprefixer
// npm i -D gulp-jade
// npm i -D gulp-load-plugins
// npm i -D gulp-plumber
// npm i -D gulp-rename
// npm i -D gulp-sass
// npm i -D gulp-coffee
// npm i -D gulp-sourcemaps
// npm i -D gulp-uglify
