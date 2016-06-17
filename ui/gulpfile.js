var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	sass = require('gulp-sass'),
	connect = require('gulp-connect'),
	cssnano = require('gulp-cssnano'),
	livereload = require('gulp-livereload'),
	postcss = require('gulp-postcss'),
	px2rem = require('postcss-px2rem'),
	autoprefixer = require('autoprefixer'),
	uglify = require('gulp-uglify');
//目标目录
var dist = '../../../dist/libs/ui/';

//sass编译
gulp.task('sass', function() {
	var processors = [px2rem({remUnit: 75}), autoprefixer()];
	return gulp.src('./sass/**/*.scss')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(gulp.dest('./css'));
});
//css压缩
gulp.task('css', ['sass'], function() {
	gulp.src('./css/**/*.css')
		.pipe(cssnano())
		.pipe(gulp.dest(dist+'css/'))
		.pipe(livereload());
});

//html压缩
gulp.task('html', function() {
	gulp.src('*.html')
		.pipe(gulp.dest(dist))
		.pipe(livereload());
});

//js压缩
gulp.task('js', function() {
	gulp.src('./js/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(dist+'js/'))
		.pipe(livereload());
});

//test文件
gulp.task('test', function() {
	gulp.src('./test/**/**/*')
		.pipe(gulp.dest(dist+'test/'))
		.pipe(livereload());
});

//font
gulp.task('font', function() {
	gulp.src('./font/*')
		.pipe(gulp.dest(dist+'font/'))
		.pipe(livereload());
});

//启动一个本地调试服务器
gulp.task('server', function(){
	var option = {
		root : dist,
		port : 8988
	};
	connect.server(option);
});

//监控
gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('sass/**/*.scss', ['sass']);
	gulp.watch('css/**/*.css', ['css']);
	//gulp.watch('./js/*.js', ['webpack']);
	gulp.watch('font/*', ['font']);
	gulp.watch('js/**/*.js', ['js']);
	gulp.watch('**.html', ['html']);
	gulp.watch('test/**/**/*', ['test']);
});

//asset
gulp.task('assets', function() {
	gulp.src('./assets/**/*')
		.pipe(gulp.dest(dist+'assets/'));
});

//gulp.task('default', function(){
//	gulp.src('./js/*.js')
//		.pipe(gulp.dest(dist));
//
//	gulp.src('./font/*.ttf')
//		.pipe(gulp.dest(dist+'font/'));
//
//	gulp.src('./*.html')
//		.pipe(gulp.dest(dist));
//
//	gulp.src('./css/*.css')
//		.pipe(gulp.dest(dist+'css/'));
//});

