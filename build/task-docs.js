const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const gulp = require('gulp');
const gulpJsdoc = require('gulp-jsdoc3');

// generate docs
const generateDocs = (isProd, isTest, done) => {
    let jsdocsConfig = require('./.jsdocs.json');

    // fill docs array
    jsdocsConfig.docs = [];
    jsdocsConfig.docs.push('README.md');
    if (buildSettings.docs.isAddSysDocs) {
        jsdocsConfig.docs.push(buildSettings.source.syswww + 'loader.js');
    }
    for(let root in buildSettings.source) {
        if (buildSettings.source.hasOwnProperty(root)) {
            if (!buildSettings.docs.isAddSysDocs && root === buildSettings.source.syswww) {
                continue;
            }
            let globs = utils.getSource(root, 'members', '*.js', '**/*.js');
            for(let glob of globs) {
                jsdocsConfig.docs.push(glob);
            }    
        }
    }

    // define totorials place
    jsdocsConfig.config.opts.tutorials = buildSettings.docs.tutorials;

    gulp.src(jsdocsConfig.docs, {read: false})
        .pipe(gulpJsdoc(jsdocsConfig.config, done))
        .on('error', utils.errorHandler('jsdocs'));   
};
exports.generator = function(isProd, isTest, cb) {
    generateDocs(isProd, isTest, cb);
};