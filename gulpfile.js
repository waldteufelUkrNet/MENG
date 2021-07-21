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
        baseDir : 'app/server/public'
      },
      notify: false // відключення повідомлень browserSync
    });
  }
  exports.startBrowserSync = startBrowserSync;

  // index.pug -> index.html
  function convertPug(){
    return src('app/client/index.pug')
           // .pipe(changed('app/', {extension: '.html'}))
           .pipe(pug({
             pretty : true
           }))
           .on('error', notify.onError({
             message : 'Error: <%= error.message %>',
             title   : 'PUG error'
           }))
          .pipe( dest('app/server/public/') )
  }
  exports.convertPug = convertPug;

  // scss -> css: files
  function convertSCSS() {
    return src('app/client/scss/index.scss')
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
           .pipe( rename('index.min.css') )
           .pipe( dest('app/server/public/css/') )
           .pipe( bs.stream() )
  }
  exports.convertSCSS = convertSCSS;

  // js
  function convertJS() {
    return src('app/client/js/index.js')
           .pipe( uglify() )
           .on('error', notify.onError({
              message : 'Error: <%= error.message %>',
              title   : 'JS error'
            }))
           .pipe( rename('index.min.js') )
           .pipe( dest('app/server/public/js/') )
           .pipe( bs.stream() )
  }
  exports.convertJS = convertJS;

  // watching & live reload
  function startWatch(){
    watch(['app/client/index.pug'], convertPug);
    watch(['app/client/scss/index.scss'], convertSCSS);
    watch(['app/client/js/index.js'], convertJS );
    watch(['app/server/public/index.html']).on('change',  bs.reload);
  }
  exports.startWatch = startWatch;

  exports.default = series(convertSCSS, convertJS, convertPug, parallel(startBrowserSync, startWatch));
/* ↑↑↑ /TASKS ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////
/* ↓↓↓ ЩО ДОРОБИТИ ↓↓↓ */
  // на майбутнє: мініфікація картинок у проміжну теку (з changed), build уже через неї

  // gulp-babel               // ES6 -> ES5
  // gulp-cache               // бібліотека кешування
  // gulp-changed             // контроль за змінами у файлах - пропускає потік далі, тільки якщо були зміни у файлі
  // gulp-concat-css          // склеювання css-файлів
  // gulp-css-purge           // видалення дублюючого коду css
  // gulp-cssnano / gulp-csso // мініфікація css-файлів
  // gulp-load-plugins        // щоб не оголошувати кожну змінну, застосовується для плагінів із префіксом gulp-
  // gulp-sourcemaps          //

  // задачі
  // pug, scss, js: index, pages, libs
  // img
  // build
  // fonts
  // reset

  // function build(){
  //   return src([...], {base:'app'}).pipe( dest(dest) )
  // }
  // exports

  // function callback() {
  //   console.log('trololo')
  // }

  // чищення каталогу dist
  // gulp.task('clean', function(done) {
  //   return del('dist');
  //   done();
  // });

  // обробка зображень
  // gulp.task('img', function() {
  //   return gulp.src('app/img/**/*')
  //     // .pipe(cache(imagemin({
  //     //   interlaced  : true,
  //     //   progressive : true,
  //     //   svgoPlugins : [{removeViewBox: false}],
  //     //   use         : [pngquant()]
  //     // })))
  //     .pipe(gulp.dest('dist/img'));
  // });

  // очистка кешу
  // gulp.task('clear', function () {
  //     return cache.clearAll();
  // })

  // // перенесення файлів з каталогу app в dist
  // gulp.task('build', gulp.series(['clean', 'img'], function(done) {

  //   // pug -> html
  //   gulp.src('app/index.pug').pipe(pug({pretty : false})).pipe(gulp.dest('dist/'));
  //   gulp.src('app/books/**/*.pug').pipe(pug({pretty : false})).pipe(gulp.dest('dist/books/'));

  //   // fonts
  //   gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

  //   // js
  //   // gulp.src('app/js/**/*').pipe(uglify()).pipe(gulp.dest('dist/js/'));
  //   gulp.src('app/js/**/*').pipe(gulp.dest('dist/js/'));

  //   // css
  //   gulp.src('app/css/**/*').pipe(csso()).pipe(gulp.dest('dist/css/'));

  //   // img
  //   gulp.src('app/books/**/*.jpg').pipe(gulp.dest('dist/books/'));

  //   done();
  // }));
/* ↑↑↑ /ЩО ДОРОБИТИ ↑↑↑ */
////////////////////////////////////////////////////////////////////////////////