var babelify = require('babelify');
// var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
// var watch = require('gulp-watch');
// var watchify = require('watchify');



gulp.task('default', ['html', 'css', 'js', 'serve', 'watch']);


gulp.task('html', function() {
	'use strict';
	gulp.src('src/index.html', { base: 'src' })
		.pipe(gulp.dest('dist'));
});


gulp.task('css', function() {
	'use strict';
	gulp.src('src/styles/main.css', { base: 'src/styles/' })
		.pipe(gulp.dest('dist'));
});


gulp.task('js', function() {
	'use strict';
	browserify({
		entries: 'src/main.js',
		debug: true
	})
	.transform(babelify)
	.bundle()
	.pipe(source('app.js'))
	.pipe(gulp.dest('dist'));
});


gulp.task('serve', function() {
	'use strict';
	browserSync({
		server: {
			baseDir: 'dist',
			open: true
		}
	});
});

gulp.task('reload', function() {
	'use strict';
	browserSync.reload();
});

gulp.task('watch', function() {
	'use strict';
	gulp.watch('src/**/*.js', ['js', 'reload']);
});


/*gulp.task('browserify', function() {
	bundle(false);
});

gulp.task('watch', function() {
	bundle(true);
});

function bundle(watch) {
	var bundler;

	if (watch) {
		bundler = watchify(browserify('src/main.js', watchify.args));
		bundler
			.on('update', function() {
				console.log('update!');
				rebundle(bundler);
			})
			.on('log', function(e) {
				console.log(e);
			});
	} else {
		bundler = browserify('src/main.js', { debug: true });
	}

	bundler
		.transform(babelify)
		.require('src/main.js', { entry: true });


	function rebundle(bundler) {
		return bundler.bundle()
			.on('error', function(e) {
				console.log('browserify error', e.message);
			})
			.pipe(source('app.js'))
			.pipe(buffer())
			.pile(gulp.dest('dist'))
			.pipe(browserSync.reload({
				stream: true,
				once: true
			}));
	}

}*/
