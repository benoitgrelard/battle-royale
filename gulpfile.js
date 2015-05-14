/* jshint node: true */

var assign = require('lodash.assign');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var del = require('del');
var ghpages = require('gh-pages');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var path = require('path');
var util = require('gulp-util');
var reload = browserSync.reload;
var source = require('vinyl-source-stream');
var watchify = require('watchify');



/**
 * CONFIG
 * ============================================================================
 */
var sourcePath = './src/';
var distPath = './dist/';


/**
 * MAIN TASKS
 * ============================================================================
 */
gulp.task('default', ['dev']);
gulp.task('dev', ['lint', 'clean', 'html', 'css', 'serve', 'watch']);
gulp.task('build', ['lint', 'clean', 'html', 'css', 'js']);
gulp.task('deploy', ['build', 'deploy-gh-pages']);


/**
 * SUB-TASKS
 * ============================================================================
 */
gulp.task('clean', function() {
	'use strict';
	return del(distPath + '**');
});

gulp.task('lint', function() {
	'use strict';
	return gulp.src(['gulpfile.js', sourcePath + '**/*.js'])
			   .pipe(jshint())
			   .pipe(jshint.reporter('default'));
});

gulp.task('html', function() {
	'use strict';
	return gulp.src(sourcePath + 'index.html')
			   .pipe(gulp.dest(distPath));
});


gulp.task('css', function() {
	'use strict';
	return gulp.src(sourcePath + 'styles/main.css')
			   .pipe(gulp.dest(distPath));
});


gulp.task('js', function() {
	'use strict';
	var options = {
		entries: [sourcePath + 'main.js'],
		debug: false
	};

	return browserify(options)
			.transform(babelify)
			.bundle()
			.pipe(source('app.js'))
			.pipe(gulp.dest(distPath));
});


gulp.task('serve', function() {
	'use strict';
	return browserSync({
			server: {
				baseDir: distPath,
				open: true
			}
		});
});

gulp.task('watch', function() {
	'use strict';

	watchHtml();
	watchCss();
	watchJs();

	function watchHtml() {
		gulp.watch('index.html', { cwd: sourcePath }, ['html', reload]);
	}

	function watchCss() {
		gulp.watch('styles/main.css', { cwd: sourcePath }, ['css', function() {
			reload(distPath + 'main.css');
		}]);
	}

	function watchJs() {
		var options = {
			entries: [sourcePath + 'main.js'],
			debug: true
		};
		options = assign({}, watchify.args, options);
		var bundler = watchify(browserify(options));

		bundler
			.transform(babelify)
			.on('update', bundle)
			.on('log', util.log);

		return bundle();

		function bundle() {
			return bundler
				.bundle()
				.on('error', util.log.bind(util, 'Browserify Error'))
				.pipe(source('app.js'))
				.pipe(gulp.dest(distPath))
				.pipe(reload({
					stream: true,
					once: true
				}));
		}
	}
});

gulp.task('deploy-gh-pages', function(cb) {
	'use strict';
	return ghpages.publish(path.join(process.cwd(), distPath), cb);
});
