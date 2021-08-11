'use strict'
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ VARIABLES ↓↓↓ */
  const { src,
          dest,
          task,
          series,
          parallel,
          watch
        } = require('gulp');

  const bs      = require('browser-sync').create(),
        del     = require('del'),
        autopre = require('gulp-autoprefixer'),
        concat  = require('gulp-concat'), // ??? а css?
        imgmin  = require('gulp-imagemin'),
        notify  = require('gulp-notify'),
        pug     = require('gulp-pug'),
        rename  = require('gulp-rename'),
        scss    = require('gulp-sass')(require('sass')),
        uglify  = require('gulp-uglify-es').default;
/* ↑↑↑ /VARIABLES ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ TASKS ↓↓↓ */
  // server for live reload
  function startBrowserSync() {
    bs.init({
      server : {
        baseDir : 'app/client/'
      },
      notify: false // відключення повідомлень browserSync
    });
  }
  exports.startBrowserSync = startBrowserSync;

  // index.pug -> index.html
  function convertIndexPug(){
    return src('app/client/index.pug')
           // .pipe(changed('app/', {extension: '.html'}))
           .pipe(pug({
             pretty : true
           }))
           .on('error', notify.onError({
             message : 'Error: <%= error.message %>',
             title   : 'PUG error'
           }))
          .pipe( dest('app/client') )
  }
  exports.convertIndexPug = convertIndexPug;

  // pug -> html
  function convertPug(){
    return src('app/client/pug/*.pug')
           // .pipe(changed('app/', {extension: '.html'}))
           .pipe(pug({
             pretty : true
           }))
           .on('error', notify.onError({
             message : 'Error: <%= error.message %>',
             title   : 'PUG error'
           }))
          .pipe( dest('app/client/html/') )
  }
  exports.convertPug = convertPug;

  // scss -> css
  function convertSCSS() {
    return src('app/client/scss/main.scss')
           .pipe( scss({outputStyle: 'compressed'}) ) // nested expanded compact compressed
           .on('error', notify.onError({
              message : 'Error: <%= error.message %>',
              title   : 'SASS error'
            }))
           .pipe (autopre ({overrideBrowserslist: ['last 10 version'], grid: 'autoplace'}) )
           .on('error', notify.onError({
              message : 'Error: <%= error.message %>',
              title   : 'Autoprefixer error'
            }))
           // .pipe( rename('index.min.css') )
           .pipe( dest('app/client/css/') )
           .pipe( bs.stream() )
  }
  exports.convertSCSS = convertSCSS;

  // js modules
  function convertModulesJS() {
    return src('app/client/modules/**/*.js')
           // .pipe( uglify() )
           .on('error', notify.onError({
              message : 'Error: <%= error.message %>',
              title   : 'JS error'
            }))
           .pipe( concat('modules.js') )
           .pipe( dest('app/client/js/') )
           .pipe( bs.stream() )
  }
  exports.convertModulesJS = convertModulesJS;

  // js
  function convertJS() {
    return src('app/client/js-expanded/*.js')
           // .pipe( uglify() )
           .on('error', notify.onError({
              message : 'Error: <%= error.message %>',
              title   : 'JS error'
            }))
           // .pipe( rename('index.min.js') )
           .pipe( dest('app/client/js/') )
           .pipe( bs.stream() )
  }
  exports.convertJS = convertJS;

  // front to back
  function f2b(cb) {
    // gulp.src('app/assets/pug/*.pug').pipe(pug({pretty : false})).pipe(gulp.dest('dist/'));
    src('app/client/html/*.html').pipe(dest('app/server/public/html/'));
    src('app/client/css/*.css').pipe(dest('app/server/public/css/'));
    src('app/client/fonts/**/*.*').pipe(dest('app/server/public/fonts/'));
    src('app/client/img/**/*.*').pipe(dest('app/server/public/img/'));
    src('app/client/js/*.js').pipe(dest('app/server/public/js/'));
    src('app/client/libs-css/*.{css,scss}').pipe(dest('app/server/public/libs-css/'));
    src('app/client/libs-js/*.js').pipe(dest('app/server/public/libs-js/'));
    cb();
  }
  exports.f2b = f2b;

  // watching & live reload
  function startWatch(){
    watch(['app/client/index.pug'], convertIndexPug);
    watch(['app/client/pug/*.pug', 'app/client/modules/**/*.pug'], convertPug);
    watch(['app/client/scss/*.scss', 'app/client/modules/**/*.scss'], convertSCSS);
    watch(['app/client/modules/**/*.js'], convertModulesJS);
    watch(['app/client/js-expanded/*.js'], convertJS );
    watch(['app/client/index.html', 'app/client/html/*.html']).on('change',  bs.reload);

    // copy data from client app to server app
    watch(['app/client/html/*.html'], function f2b_html() {
      return src('app/client/html/*.html').pipe(dest('app/server/public/html/'));
    });
    watch(['app/client/css/*.css'], function f2b_css() {
      return src('app/client/css/*.css').pipe(dest('app/server/public/css/'));
    });
    watch(['app/client/fonts/**/*.*'], function f2b_fonts() {
      return src('app/client/fonts/**/*.*').pipe(dest('app/server/public/fonts/'));
    });
    watch(['app/client/img/**/*.*'], function f2b_img() {
      return src('app/client/img/**/*.*').pipe(dest('app/server/public/img/'));
    });
    watch(['app/client/js/*.js'], function f2b_js() {
      return src('app/client/js/*.js').pipe(dest('app/server/public/js/'));
    });
    watch(['app/client/libs-css/*.{css,scss}'], function f2b_libs_css() {
      return src('app/client/libs-css/*.{css,scss}').pipe(dest('app/server/public/libs-css/'));
    });
    watch(['app/client/libs-js/*.js'], function f2b_libs_js() {
      return src('app/client/libs-js/*.js').pipe(dest('app/server/public/libs-js/'));
    });
  }
  exports.startWatch = startWatch;

  exports.default = series(convertSCSS, convertModulesJS, convertJS, convertPug, convertIndexPug, f2b, parallel(startBrowserSync, startWatch));
/* ↑↑↑ /TASKS ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////