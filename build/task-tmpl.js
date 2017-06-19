const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const injectFile = require('gulp-inject-file');
const gulpIf = require('gulp-if');
const injectString = require('gulp-inject-string');
const header = require('gulp-header');
const rename = require('gulp-rename');
const gulp = require('gulp');
const pkg = require('../package.json');
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

const processTemplates = (isProd, isTest, root, whenDone) => {
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
            .pipe(gulpIf(isProd, injectString.replace('{.min}', '.min'), injectString.replace('{.min}', '')))
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
exports.processor = function(isProd, isTest, cb) {
 let folders = [];
    for(let dir in buildSettings.source) {
        if (buildSettings.source.hasOwnProperty(dir)) {
            folders.push(buildSettings.source[dir]);
        }
    }

    let doProcess = () => {
        if (folders.length === 0) { cb(); return; }
        let nextFolder = folders.shift();
        processTemplates(isProd, isTest, nextFolder, doProcess);
    };
    doProcess();    
};