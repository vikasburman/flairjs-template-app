const runSequence = require('run-sequence');
const gulp = require('gulp');
let isProd = false;
let isTest = false;

// task: clean (to delete all generated files)
gulp.task('clean', (done) => {
    let cleaner = require('./build/task-clean.js').cleaner;
    cleaner(isProd, isTest, done);
});

// task: cfg (to generate .config.json file)
gulp.task('cfg', (done) => {
    let generator = require('./build/task-cfg.js').generator;
    generator(isProd, isTest, done);
});

// task: process templates (to regenerate all templatzed files)
gulp.task('tmpl', (done) => {
    let processor = require('./build/task-tmpl.js').processor;
    processor(isProd, isTest, done);
});

// task: asm (to generate .asm.js files for each assembly folder)
const asms = {
    paths: {},
    bundles: {}
};
gulp.task('asm', (done) => {
    let assembler = require('./build/task-asm.js').assembler;
    assembler(isProd, isTest, asms, done);
});

// task: compress (minify files)
gulp.task('compress', (done) => {
    let compressor = require('./build/task-compress.js').compressor;
    compressor(isProd, isTest, done);
});

// task: env (generate env data for loader)
gulp.task('env', (done) => {
    let generator = require('./build/task-env.js').generator;
    generator(isProd, isTest, asms, done);
});

// task: docs (generate docs)
gulp.task('docs', (done) => {
    let generator = require('./build/task-docs.js').generator;
    generator(isProd, isTest, done);
});

// task: tst
gulp.task('tst', (done) => {
    let tester = require('./build/task-test.js').tester;
    tester(isProd, isTest, done);
});


// Execution sequences
// task: test
gulp.task('test', (cb) => {
    isProd = false;
    isTest = true;
    runSequence('clean', 'cfg', 'tmpl', 'asm', 'env', 'tst', cb);
});

// task: build (dev)
gulp.task('dev', (cb) => {
    isProd = false;
    isTest = false;
    runSequence('clean', 'cfg', 'tmpl', 'asm', 'env', 'docs', cb);
});

// task: build (prod)
gulp.task('prod', (cb) => {
    isProd = true;
    isTest = false;
    runSequence('clean', 'cfg', 'tmpl', 'asm', 'compress', 'env', 'docs', cb);
});

// task: default
gulp.task('default', ['dev'], () => {
});