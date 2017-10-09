"use strict";

const gulp = require('gulp');
const pug = require('gulp-pug');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');

//styles
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
// const sassGlob = require('gulp-sass-glob');

// scripts
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const eslint = require('gulp-eslint');

// sprite svg
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');


const paths = {
  root: './build',
  templates: {
    pages: 'src/templates/pages/*.pug',
    src: 'src/templates/**/*.pug',
    dest: 'build/assets/'
  },
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'build/assets/styles/'
  },
  sprite:{
    scr: 'src/img/icons/*.svg',
    dest: 'build/assets/images/sprite'
  },
  svgCopy: {
    src: 'src/img/icons/*.svg',
    dest: 'build/assets/images/sprite'
  },
  images: {
    src: 'src/img/**/*.*',
    dest: 'build/assets/images'
  },
  fonts: {
    src: 'src/fonts/**/*.*',
    dest: 'build/assets/fonts'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'build/assets/scripts'
  }
}

// Слежка за исходными файлами
function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.templates.src, templates);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.svgCopy.src, svgCopy);
  gulp.watch(paths.fonts.src, fonts);
  gulp.watch(paths.scripts.src, scripts);
}

// pug
function templates() {
  return gulp.src(paths.templates.pages)
    .pipe(pug({
      pretty: true
    })).on('error', notify.onError({
      message: "<%= error.message %>",
      title: "Error!"
    }))
    .pipe(gulp.dest(paths.root))
}

// scss
function styles() {
  return gulp.src('./src/styles/app.scss')
    .pipe(sourcemaps.init())
    // .pipe(sassGlob())
    .pipe(sass().on('error', notify.onError({
      message: "<%= error.message %>",
      title: "Scss Error!"
    })))
    .pipe(sourcemaps.write())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe( notify( 'SCSS - хорошая работа!' ) );
}

//sprite svg
function spriteSvg() {
  return gulp.src('src/img/icons/*.svg')
    // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill, style and stroke declarations in out shapes
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(gulp.dest(paths.sprite.dest))
}

// del
function clean() {
  return del(paths.root);
}

// webpack
function scripts() {
  return gulp.src('src/scripts/app.js')
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest(paths.scripts.dest))
}


// Слежка build и reload браузер
function server() {
  browserSync.init({
    server: paths.root
  });
  browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}

//переносим картинки
function images() {
  return gulp.src([paths.images.src, '!src/img/icons/**'])
    .pipe(gulp.dest(paths.images.dest));
}

//переносим svg
function svgCopy() {
  return gulp.src([paths.svgCopy.src])
    .pipe(gulp.dest(paths.svgCopy.dest));
}

//переносим шрифты
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

// eslint
function lintJs() {
  return gulp.src(['src/scripts/*.js', '!node_modules/**'])
    .pipe(eslint({
      rules: {
        'my-custom-rule': 1,
        'strict': 2
      },
      globals: [
        'jQuery',
        '$'
      ],
      options: {
        fix: true
      },
      envs: [
        'browser'
      ]
    }))
    .pipe(eslint.formatEach('compact', process.stderr));
}

exports.templates = templates;
exports.styles = styles;
exports.clean = clean;
exports.images = images;
exports.svgCopy = svgCopy;
exports.fonts = fonts;
exports.lintJs = lintJs;
exports.spriteSvg = spriteSvg;

// работа
gulp.task('default', gulp.series(
  gulp.parallel(styles, templates, scripts, lintJs, fonts, spriteSvg, images, svgCopy),
  gulp.parallel(watch, server)
));
// На продакшен
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(styles, templates, scripts, lintJs, fonts, spriteSvg, images, svgCopy)
));