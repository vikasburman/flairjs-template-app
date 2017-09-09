const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const rename = require('gulp-rename');
const gulp = require('gulp');
const uglifyjs = require('uglify-js-harmony')
const uglify = require('gulp-uglify');
const minifier = require('gulp-uglify/minifier');
const cfg = require('../config.json');

//TODO: html templates compressor and css lint and minify is to be added

const compressFiles = (isDev, isProd, isTest, root, whenDone) => {
    let folders = utils.getFolders(root);
    const uglifyConfig = require('./.uglify.json');
    const processFile = (folder, _done) => {
        gulp.src(utils.getSource(root, folder, '/**/*.asm.js', '/**/static/loader.js'))
            // minify
            .pipe(minifier(uglifyConfig.js, uglifyjs))
            .on('error', utils.errorHandler('minifier'))
            
            // rename 
            .pipe(rename((path) => {
                path.extname = '.min' + path.extname; // from <name.whatever> to <name.min.whatever>
            }))
            .on('error', utils.errorHandler('rename'))
            
            // write to output again
            .pipe(gulp.dest(root + folder))
            .on('end', _done)
            .on('error', utils.errorHandler('dest'));
    }
    const processFiles = (folders, onDone) => {
        let folder = folders.shift(); 
        if (folder) {
            processFile(folder, () => {
                if (folders.length === 0) {
                    onDone();
                } else {
                    processFiles(folders, onDone);
                }
            });
        } else {
            onDone();
        }
    };
    processFiles(folders, whenDone);
};
exports.compressor = function(isDev, isProd, isTest, cb) {
    if (!cfg.settings.minify) { 
        cb();
        return;
    }
    // note: server side assemblies (.app) are explicitely left as compressing is not required/not used
    let dirs = [
        'sys/modules/',
        'sys/modules_web/',
        'web/modules/'
    ];
    let doProcess = () => {
        if (dirs.length === 0) { cb(); return; }
        let nextFolder = dirs.shift();
        compressFiles(isDev, isProd, isTest, nextFolder, doProcess);
    };
    doProcess();
};