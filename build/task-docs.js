const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const gulp = require('gulp');
const gulpJsdoc = require('gulp-jsdoc3');
const cfg = require('../config.json');

// generate docs
const generateDocs = (isDev, isProd, isTest, done) => {
    let jsdocsConfig = require('./.jsdocs.json');

    // fill docs array
    jsdocsConfig.docs = [];
    jsdocsConfig.docs.push('README.md');
    if (buildSettings.docs.isAddSysDocs) {
        jsdocsConfig.docs.push('sys/modules/core/static/loader.js');
    }
    let dirs = [
        'sys/modules/',
        'web/modules/',
        'app/modules/'
    ];    
    for(let root of dirs) {
        if (!buildSettings.docs.isAddSysDocs && root === 'sys/modules/') {
            continue;
        }
        let globs = utils.getSource(root, 'members', '*.js', '**/*.js');
        for(let glob of globs) {
            jsdocsConfig.docs.push(glob);
        }    
    }

    // define totorials place
    jsdocsConfig.config.opts.tutorials = buildSettings.docs.tutorials;

    gulp.src(jsdocsConfig.docs, {read: false})
        .pipe(gulpJsdoc(jsdocsConfig.config, done))
        .on('error', utils.errorHandler('jsdocs'));   
};
exports.generator = function(isDev, isProd, isTest, cb) {
    if (!cfg.settings.docs) {
        cb();
        return;
    }
    generateDocs(isDev, isProd, isTest, cb);
};