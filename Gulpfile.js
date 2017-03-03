// File: Gulpfile.js
'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var historyApiFallback = require('connect-history-api-fallback');
var webserver = require('gulp-webserver');
var stylus = require('gulp-stylus');
var nib = require('nib');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var opn = require('opn');
var inject = require('gulp-inject');
var wiredep = require('wiredep').stream;

var options = {
    bowerJson: require('./bower.json'),
    directory: './app/lib/'
}

var server = {
  host: 'localhost',
  port: '8000', 
  page_init: 'index.html', 
  folder_init: 'app'
}

// Servidor web de desarrollo
gulp.task('server', function() {
	gulp.src('./')
	.pipe(webserver({
	  directoryListing: true,
	  open: true, 
	  log:'debug',
	  host:server.host,
      port: server.port,
      livereload: true
	}));
});

// Busca errores en el JS y nos los muestra por pantalla
gulp.task('jshint', function() { 
	return gulp.src('./app/scripts/**/*.js')
		.pipe(jshint('.jshintrc')) 
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail')); 
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('css', function() {
	gulp.src('./app/stylesheets/main.styl')
	.pipe(stylus({ use: nib() }))
	.pipe(gulp.dest('./app/stylesheets'))
	.pipe(connect.reload());
});

// Recarga el navegador cuando hay cambios en el HTML
gulp.task('html', function() {
	gulp.src('./app/**/*.html')
	.pipe(connect.reload());
});


// Busca en las carpetas de estilos y javascript los archivos que hayamos creado
// para inyectarlos en el index.html
gulp.task('inject', function() {
	var sources = gulp.src(['./app/scripts/**/*.js','./app/stylesheets/**/*.css']);
	return gulp.src('index.html', {cwd: './app'})
	.pipe(inject(sources, {read: false}))
	.pipe(gulp.dest('./app'));
});

//gulp.task('inject_bower', function() {
//	var sources = gulp.src(['./app/lib/**/*.min.css']);
//	return gulp.src('index.html', {cwd: './app'})
//	.pipe(inject(sources, {read: false}))
//	.pipe(gulp.dest('./app'));
//});

// Inyecta las librerias que instalemos vía Bower
gulp.task('wiredep', function () {
	return gulp.src('./app/index.html')
		.pipe(wiredep(options))
		.pipe(gulp.dest('./app'));
});


// Vigila cambios que se produzcan en el código
// y lanza las tareas relacionadas
gulp.task('watch', function() {
	gulp.watch(['./app/**/*.html'], ['html']);
	gulp.watch(['./app/stylesheets/**/*.styl'], ['css', 'inject', 'inject_bower']);
	gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
	gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('openbrowser', function() {
  opn( 'http://' + server.host + ':' + server.port +'/'+ server.folder_init +'/'+ server.page_init);
});

gulp.task('default', ['server', 'inject', 'wiredep',  'watch', 'jshint', 'openbrowser']);
