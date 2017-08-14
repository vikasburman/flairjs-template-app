const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const gulp = require('gulp');
const path = require('path');
const jasmineNode = require('gulp-jasmine');

// do test
const doTest = (isDev, isProd, isTest, done) => {
    const jasminConfig = require('./.jasmine.json'),
        tests = [];

    // fill tests array
    tests.push(require('app-root-path') + '/' + 'sys/modules/core/static/loader.js');
    let dirs = [
        'sys/modules/',
        'web/modules/',
        'app/modules/'
    ];   
    for(let root of dirs) {
        tests.push(root + '**/tests/*.spec.js');
    }
    gulp.src(tests)
        .pipe(jasmineNode(jasminConfig))
        .on('end', done)
        .on('error', utils.errorHandler('jasmine'));

    // HACK: pipe() is not exising and hence end/error done() is not called via pipe, 
    // so calling done() manually below - this seems to be working so far
    // but need to be revisited for a better solution
};
exports.tester = function(isDev, isProd, isTest, cb) {
    doTest(isDev, isProd, isTest, cb);
};