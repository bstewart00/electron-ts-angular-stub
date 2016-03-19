var gulp = require("gulp");
var typescript = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var exec = require("child_process");
var runSequence = require("run-sequence");
var less = require("gulp-less");
var packager = require("electron-packager");
var del = require("del");

var paths = {
    dest: 'compiled',
    package: {
        tmp: '.package_tmp',
        dest: 'package'
    },
    typescript: 'src/**/*.ts',
    html: 'src/**/*.html',
    less: 'src/browser/styles/**/*.less'
};

var packageJson = require('./package.json');

gulp.task('typescript', function () {
    var tsProject = typescript.createProject('tsconfig.json');
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dest));
});

gulp.task('watch-typescript', function () {
    return gulp.watch(paths.typescript, ['typescript']);
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.dest + '/src'));
});

gulp.task('watch-html', function () {
    return gulp.watch(paths.html, ['html']);
});

gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(paths.dest + '/src/browser'));
});

gulp.task('watch-less', function () {
    return gulp.watch(paths.less, ['less']);
});

gulp.task('static', function () {
    return gulp.src('static/**/*')
        .pipe(gulp.dest(paths.dest + '/static'));
});

gulp.task('compile-clean', function () {
   return del.sync([paths.dest], { force: true }); 
});

gulp.task('package-clean', function () {
   return del.sync([paths.package.dest, paths.package.tmp], { force: true }); 
});

gulp.task('package-cleanTmpDir', function () {
   return del.sync([paths.package.tmp], { force: true }); 
});

gulp.task('package-copy-dest', function () {
    return gulp.src(paths.dest + '/**', { base: paths.dest })
        .pipe(gulp.dest(paths.package.tmp + '/' + paths.dest));
});

gulp.task('package-copy-projectJson', function () {
    return gulp.src('package.json').pipe(gulp.dest(paths.package.tmp));
});

gulp.task('package-copy-files', ['package-copy-projectJson', 'package-copy-dest']);

gulp.task('package-npm-install', function (done) {
    exec.exec('npm install --production', { cwd: './' + paths.package.tmp }, done);
});

gulp.task('run', function () {
    exec.exec('.\\node_modules\\.bin\\electron .');
});

gulp.task('create-package', function (done) {
    packager({
        dir: paths.package.tmp,
        name: packageJson.name,
        platform: 'win32',
        arch: 'x64',
        version: '0.36.11',
        overwrite: true,
        out: paths.package.dest,
    }, function (err, path) {
        if (err) {
            console.log(err);
        }
        done();
    });
});

gulp.task('package', function (done) {
    runSequence('default', 'package-clean', 'package-copy-files', 'package-npm-install', 'create-package', 'package-cleanTmpDir', done);
});

gulp.task('watch', ['watch-typescript', 'watch-html', 'watch-less']);
gulp.task('clean', ['package-clean', 'compile-clean']);
gulp.task('compile', ['typescript', 'html', 'less', 'static']);

gulp.task('default', ['compile']);
