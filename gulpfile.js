/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    react = require('gulp-react'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint');

//compile sass to css
gulp.task('sass-to-css', function(){
	return gulp.src('assets/sass/main.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('public/css'));
});

//compile jsx to js
gulp.task('jsx-to-js', function () {
  return gulp.src('assets/js/react/*.jsx')
        .pipe(react({harmony: false, es6module: true}))
        .pipe(gulp.dest('public/js'));
});

gulp.task('to-es6', function () {
  return gulp.src([
  			'output/*.js'
  			])
        .pipe(babel())
        .pipe(gulp.dest('output'));
});

//concat files
gulp.task('concat-react-files', function(){
	return gulp.src([
			'assets/js/jquery.min.js',
			'assets/js/underscore-min.js',
			'assets/js/react/react.js', 
			'assets/js/react/react-dom.js',
			])
		.pipe(concat('react.js'))
		.pipe(gulp.dest('public/js'));
});

//watch task for changes and update
gulp.task('watch', function() {
	gulp.watch('assets/js/react/ToDoAppComponent.jsx', ['jsx-to-js']);
});

//this task is the initial task triggered, so put other tasks in here
gulp.task('default', ['sass-to-css', 'jsx-to-js']);

