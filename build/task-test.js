const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const gulp = require('gulp');
const path = require('path');
const jasmineNode = require('gulp-jasmine');

// do test
const doTest = (isProd, isTest, done) => {
    const jasminConfig = require('./.jasmine.json'),
        tests = [];

    // fill tests array
    tests.push(require('app-root-path') + '/' + buildSettings.source.sys + 'loader.js');
    for(let root in buildSettings.source) {
        if (buildSettings.source.hasOwnProperty(root)) {
            tests.push(buildSettings.source[root] + '**/tests/*.spec.js');
        }
    }
    gulp.src(tests)
        .pipe(jasmineNode(jasminConfig))
        .on('end', done)
        .on('error', utils.errorHandler('jasmine'));

    // HACK: pipe() is not exising and hence end/error done() is not called via pipe, 
    // so calling done() manually below - this seems to be working so far
    // but need to be revisited for a better solution
};
exports.tester = function(isProd, isTest, cb) {
    doTest(isProd, isTest, cb);
};