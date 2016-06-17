var gulp = require('gulp'),
	cssnano = require('gulp-cssnano'),
	plumber = require('gulp-plumber'),
	replace = require('gulp-replace'),
	uglify = require('gulp-uglify'),
	image = require('gulp-image'),
	connect = require('gulp-connect'),
	sass = require('gulp-sass'),
	webpackStream = require('webpack-stream'),
	livereload = require('gulp-livereload'),
	autoprefixer = require('autoprefixer'),
	postcss = require('gulp-postcss'),
	px2rem = require('postcss-px2rem'),
	htmlmin = require('gulp-htmlmin');

//全局配置相关
var config = require('./config.js')
var dist = config.server.release;

//sass编译
gulp.task('sass', function () {
	var processors = [px2rem({remUnit: config.css.rem}), autoprefixer()];
	return gulp.src('./sass/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(gulp.dest('./css/')).pipe(livereload());
});

//css压缩
gulp.task('css', ['sass'], function () {
	return gulp.src('./build/css/**/*.css')
		.pipe(cssnano())
		.pipe(gulp.dest(dist+'css/'))
		.pipe(livereload());
});

//webpack打包
gulp.task('webpack', function () {
	return gulp.src('./js/*.js')
		.pipe(webpackStream(config.webpack))
		.pipe(gulp.dest('./build/js/')).pipe(livereload());
});

//js压缩
gulp.task('js', ['webpack'], function () {
	return gulp.src('./build/js/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest(dist+'js/')).pipe(livereload());
});

//image压缩
gulp.task('image', function () {
	return gulp.src('./img/**')
		.pipe(image())
		.pipe(gulp.dest(dist+'img/'));
});

//字体生成
gulp.task('font', function(){
	return gulp.src('./font/*.+(eot|svg|ttf|woff)')
		.pipe(gulp.dest(dist+'font/'));
});

//html压缩
gulp.task('html', function () {
	//生成时间戳
	var stream = gulp.src('./*.html');
	for (var key in config.macro) {
		if (config.macro.hasOwnProperty(key)) {
			stream = stream.pipe(replace(key, config.macro[key]));
		}
	}
	return stream.pipe(htmlmin({collapseWhitespace: config.html.collapseWhitespace})).pipe(gulp.dest(dist)).pipe(livereload());
});

//监控
gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('sass/**/*.scss', ['sass']);
	//gulp.watch('./build/css/**/*.css', ['css']);
	gulp.watch('js/**/*.js', ['webpack']);
	//gulp.watch('**.html', ['html']);
});

//启动一个本地调试服务器
gulp.task('server', function () {
	connect.server({
		root: dist,
		port: config.server.port
	});
});

//执行所有操作
gulp.task('default', ['sass', 'css', 'js', 'html', 'image'], function () {
	return gulp.src('./build/**').pipe(gulp.dest(dist));
});