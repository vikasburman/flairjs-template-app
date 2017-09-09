const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const injectFile = require('gulp-inject-file');
const gulpIf = require('gulp-if');
const injectString = require('gulp-inject-string');
const header = require('gulp-header');
const rename = require('gulp-rename');
const gulp = require('gulp');
const fs = require('fs');
const pkg = require('../package.json');
const cfg = require('../config.json');
const JSBanner = `/** 
 * <%= pkg.name %> - <%= pkg.description %>
 * @copyright <%= pkg.copyright %>
 * @version v<%= pkg.version %>
 * @link <%= pkg.homepage %>
 * @license <%= pkg.license %>
 *
 * (powered by appgears - https://github.com/vikasburman/appgears)
 */
`;

const processTemplates = (isDev, isProd, isTest, root, whenDone) => {
    let folders = utils.getFolders(root);
    const isJSFile = (file) => {
        return (file.path.toLowerCase().endsWith('.js.tmpl'));
    };
    const processFolder = (folder, _done) => {
        gulp.src(utils.getSource(root, folder, '/**/*.tmpl'))
            // inject content
            .pipe(injectFile())
            .on('error', utils.errorHandler('injectFile'))
            
            // handle loading .min version
            .pipe(gulpIf((isProd && cfg.settings.minify), injectString.replace('{.min}', '.min'), injectString.replace('{.min}', '')))
            .on('error', utils.errorHandler('injectString'))
            
            // inject header (for .js files only)
            .pipe(gulpIf(isJSFile, header(JSBanner, { pkg : pkg } )))
            .on('error', utils.errorHandler('header'))
            
            // rename by removing .tmpl and leaving name as is    
            .pipe(rename((path) => {
                path.extname = ''; // from <name.whatever>.tmpl to <name.whatever>
            }))
            .on('error', utils.errorHandler('rename'))
            
            // write to output
            .pipe(gulp.dest(root + folder))
            .on('end', _done)
            .on('error', utils.errorHandler('dest'));
    }
    const processFolders = (folders, onDone) => {
        let folder = folders.shift(); 
        if (folder) {
            processFolder(folder, () => {
                if (folders.length === 0) {
                    onDone();
                } else {
                    processFolders(folders, onDone);
                }
            });
        } else {
            onDone();
        }
    };
    processFolders(folders, whenDone);
};
exports.processor = function(isDev, isProd, isTest, cb) {
 let folders = [],
     dirs = [
        'sys/modules/',
        'web/modules/',
        'app/modules/'
    ]; 
    for(let dir of dirs) {
        folders.push(dir);
    }

    let onAllDone = () => {
        // at the end, also process special templates placed at root folders of sys
        processTemplates(isDev, isProd, isTest, 'sys/', cb);

        // since loade.js.tmpl is copied from sys/loader.js.tmpl to sys/modules/core/static/loader.js.tmpl
        // to avoid editing cofusion, delete sys/modules/core/static/loader.js.tmpl version, as this is no longer 
        // required after loader.js is generated
        fs.unlinkSync('sys/modules/core/static/loader.js.tmpl');
    };

    let doProcess = () => {
        if (folders.length === 0) { onAllDone(); return; }
        let nextFolder = folders.shift();
        processTemplates(isDev, isProd, isTest, nextFolder, doProcess);
    };
    doProcess();
};