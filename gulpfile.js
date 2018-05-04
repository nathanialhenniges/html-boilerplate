'use strict';

/**
 * gulp modules
 */

var argv = require('yargs').argv;
var autoprefixer = require('autoprefixer');
var browserync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var named = require('vinyl-named');
var newer = require('gulp-newer');
var plumber = require('gulp-plumber');
var pngquant = require('imagemin-pngquant');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var webpack = require('webpack-stream')

// Load the configuration & set variables
var config = require('./mrdemonwolf.config.js');
var tasks = [];
var build = [];
var paths = [];
var entry = [];

/**
 * Set default & build tasks
 */
Object.keys(config.tasks).forEach(function (key) {
  if (config.tasks[key]) {
    tasks.push(key == 'webpack' ? '_' + key : key);
  }
});

Object.keys(config.tasks).forEach(function (key) {
  if (config.tasks[key] && key != 'server') {
    build.push(key);
  }
});

/**
 * Paths
 */
Object.keys(config.paths).forEach(function (key) {
  if (key != 'assets') {
    if (config.paths.assets === '') {
      paths[key] = './' + config.paths[key];
    } else {
      paths[key] = config.paths.assets + '/' + config.paths[key];
    }
  }
});

for (var i = 0; i <= config.js.entry.length - 1; i++) {
  entry.push(paths.jsSrc + '/' + config.js.entry[i]);
}

/**
 * Rebuild site & do page reload
 */
gulp.task('site-rebuild', function () {
  browserync.notify('Rebuilded site');
  browserync.reload();
});

/**
 * Wait for site-build, then launch the Server
 */
gulp.task('server', function () {
  return browserync.init({
    port: config.port,
    server: {
      baseDir: config.paths.dest,
    }
  });
});

/**
 * Sass
 */
gulp.task('sass', function () {
  return gulp.src(paths.sass + '/**/*')
    .pipe(sass({
      outputStyle: config.sass.outputStyle
    }).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        browsers: config.autoprefixer.browsers
      })
    ]))
    .pipe(gulp.dest(paths.css))
});

/**
 * Imagemin
 */
gulp.task('imagemin', function () {
  return gulp.src(paths.imagesSrc + '/**/*')
    .pipe(plumber())
    .pipe(newer(paths.images))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.images));
});

/**
 * eslint
 */
gulp.task('eslint', function () {
  return gulp.src(entry)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

/**
 * Webpack
 *
 * Bundle JavaScript files
 */
gulp.task('webpack', ['eslint'], function () {
  return gulp.src(entry)
    .pipe(plumber())
    .pipe(named())
    .pipe(webpack({
      watch: argv.watch ? true : false,
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js));
});

/**
 * For internal use only (webpack)
 */
gulp.task('_webpack', function () {
  argv.watch = true;
  gulp.start('webpack');
});


/**
 * Default task, running just `gulp` will minify the images, compile the sass, js, and site
 * launch BrowserSync, and watch files. Tasks can be configured by mrdemonwolf.config.js
 */
gulp.task('default', tasks, function () {
  if (config.tasks.imagemin) {
    watch(paths.imagesSrc + '/**/*', function () {
      gulp.start('imagemin');
    });
  }

  if (config.tasks.sass) {
    watch(paths.sass + '/**/*', function () {
      gulp.start('sass');
    });
  }

  if (config.tasks['server']) {
    watch([
      '!./node_modules/**/*',
      '!./README.md',
      '*/*.html',
      '*.html',
      paths.css + '/**/*',
      paths.js + '/**/*',
      paths.images + '/**/*'
    ], function () {
      gulp.start('site-rebuild');
    });
  }
});

/**
 * Test
 */
gulp.task('test', ['site-rebuild']);
