const browserSync = require('browser-sync').create();
const pkg = require('./package.json');

const gulp = require('gulp');
const sequence = require('gulp-sequence');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const minifyHtml = require('gulp-minify-html');
const vulcanize = require('gulp-vulcanize');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const usemin = require('gulp-usemin');
const rev = require('gulp-rev');
const scssLint = require('gulp-scss-lint');
const eslint = require('gulp-eslint');

// Set the banner content
const banner = ['/*!\n',
    ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2016-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');


// Linting
gulp.task('lint-js', function() {
    return gulp.src(['public/js/*.js', '!public/js/*.min.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('lint-styles', function() {
    return gulp.src(['public/sass/*.scss'])
        .pipe(scssLint({
            'config': '.scss-lint.yml'
        }))
        .pipe(scssLint.failReporter('E'));
});

// Compile Sass files
gulp.task('sass', function() {
    return gulp.src('public/sass/main.scss')
      .pipe(sass())
      .pipe(header(banner, { pkg: pkg }))
      .pipe(gulp.dest('public/css'))
      .pipe(browserSync.reload({
          stream: true
      }))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src('public/css/main.css')
      .pipe(sourcemaps.init())
      .pipe(cleanCSS({ compatibility: 'ie8' }))
      .pipe(rename({ suffix: '.min' }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/css'))
      .pipe(browserSync.reload({
          stream: true
      }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src([
          'public/js/*.js',
          '!public/js/*.min.js'
        ])
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(header(banner, { pkg: pkg }))
      .pipe(rename({ suffix: '.min' }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/js'))
      .pipe(browserSync.reload({
          stream: true
      }))
});

gulp.task('clean-build', function() {
  return gulp.src([
    'public/**.build.**',
  ], { read: false })
    .pipe(clean())
});

gulp.task('clean', ['clean-build'], function() {
  return gulp.src([
    'public/css',
    'public/js/*.min.js',
    'dist'
  ], { read: false })
    .pipe(clean())
});

// Run everything
gulp.task('default', sequence('sass', ['minify-js', 'minify-css']));

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'public'
        },
        ui: {
          port: 8081
        },
        port: 8080
    })
});

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'minify-css', 'minify-js'], function() {
    gulp.watch('public/sass/*.scss', ['sass']);
    gulp.watch('public/css/*.css', ['minify-css']);
    gulp.watch('public/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('public/*.html', browserSync.reload);
    gulp.watch('public/**/*.html', browserSync.reload);
    gulp.watch('public/js/**/*.js', browserSync.reload);
});

gulp.task('build-polymer', function() {
  return gulp.src('public/*.html')
    .pipe(vulcanize({
      abspath: '',
      inlineScripts: false,
      inlineCss: false,
      stripComments: false,
    }))
    .pipe(rename({
      suffix: '.build'
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('build-bundle', function() {
  return gulp.src('public/*.html')
    .pipe(usemin({
      css: [ rev ],
      html: [ function() { return minifyHtml({ empty: true }) }],
      js: [ rev ]
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-copyStatic', function() {
  gulp.src('public/bower_components/font-awesome/fonts/*', { base: 'public/bower_components/font-awesome' })
    .pipe(gulp.dest('dist'));

  return gulp.src([
      'public/assets/*',
      'public/polymer/*',
      'public/favicon.ico'
  ], { base: 'public' })
    .pipe(gulp.dest('dist'));
});

gulp.task('build', sequence('clean', 'default', 'build-copyStatic', 'build-bundle', 'clean-build'));