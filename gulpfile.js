const gulp = require('gulp');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
    ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2016-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

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

gulp.task('clean', function() {
  return gulp.src([
    'public/css',
    'public/js/*.min.js'
  ], { read: false })
    .pipe(clean())
});

// Run everything
gulp.task('default', ['sass', 'minify-css', 'minify-js']);

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
    gulp.watch('public/**/.html', browserSync.reload);
    gulp.watch('public/js/**/*.js', browserSync.reload);
});
