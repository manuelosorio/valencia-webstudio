const gulp = require("gulp"),
    clean = require("gulp-clean"),
    deploy = require('gulp-gh-pages'),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    pug = require("gulp-pug"),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    plumber = require('gulp-plumber'),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require("browser-sync").create(),
    bourbon = require('node-bourbon').includePaths,
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default;

let paths ={
  styles: {
      src: "src/assets/css/**/*.{sass,scss}",
      dest: "_dist/theme/css"
  },
  fonts: {
      src: "src/assets/fonts/**",
      dest: "_dist/theme/fonts"
  },
  html: {
    src: "src/**/*.html",
    exclude: "!src/includes/*.html",
    dest: "_dist/"
  },
  images: {
    src: "src/assets/img/**/*.{jpg,jpeg,png,svg}",
    dest: "_dist/theme/img"
  },
  scripts: {
    src: "src/assets/js/**/*.js",
    dest: "_dist/theme/js"
  }
}
function style() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: require('node-normalize-scss').with(['styles'].concat(bourbon)),
      outputStyle: "compressed"
    }))
    .on("error", sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}
function html() {
  return gulp
    .src([
      paths.html.src,
      paths.html.exclude
    ])
    .pipe(gulp.dest(paths.html.dest))
}
function font() {
  return gulp
    .src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
}
function images () {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}
function scripts() {
  return gulp.src(paths.scripts.src)
    // .pipe(concat('script.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest))
}
function fonts() {
  return gulp.src(paths.fonts.src)
  .pipe(gulp.dest(paths.fonts.dest))
}
function reload() {
  browserSync.reload();
}
function cleanDist() {
  return gulp.src('./_dist', {allowEmpty:true})
        .pipe(clean())
}
function watch() {
  browserSync.init({
    server: {
      baseDir: "./_dist"
    }
  });
  gulp.watch(paths.styles.src, style).on('change', browserSync.reload);
  gulp.watch(paths.images.src, images).on('change', browserSync.reload);
  gulp.watch(paths.scripts.src, scripts).on('change', browserSync.reload);
  gulp.watch(paths.fonts.src, scripts).on('change', browserSync.reload);
  gulp.watch(paths.html.src, html).on('change', browserSync.reload);
}
exports.cleanDist = cleanDist
exports.watch = watch
exports.style = style
exports.font = font
exports.images = images
exports.html = html
exports.scripts = scripts
exports.fonts = fonts

let build = gulp.parallel([html, style, fonts, images, scripts, fonts]);
let buildWatch = gulp.parallel([html, style, fonts, images, scripts, fonts], watch);

gulp.task('default', buildWatch)
gulp.task('static', build)
gulp.task('deploy', function () {
return gulp.src("./_dist/**/*")
  .pipe(deploy({
    remoteUrl: "https://github.com/manuelosorio/valencia-webstudio.git",
    branch: "gh-pages"
  }))
})
