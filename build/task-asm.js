const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const gulp = require('gulp');
const gulpTap = require('gulp-tap');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const injectFile = require('gulp-inject-file');
const path = require('path');
const fs = require('fs');

const assembleFiles = (isProd, isTest, asms, root, whenDone) => {
    let folders = utils.getFolders(root);
    const babelConfig = require('./.babel.json');
    const processContent = (folder) => {
        return (file, t) => {
            let isProcess = false,
                isMockFile = path.basename(file.path).endsWith('.mock.js'),
                mockFile = file.path.replace('.js', '.mock.js'),
                hasMockFile = fs.existsSync(mockFile);
            if (isTest) { // in test mode
                if (isMockFile) { // if this is mock file
                    isProcess = true; // process it
                } else { // otherwise, for any non mock file
                    if (hasMockFile) { // if corrosponding mock file exists
                        isProcess = false; // don't process it, as mockFile would be processed instead
                    } else { // otherwise
                        isProcess = true; // process this itself
                    }
                }
            } else { // in normal mode
                if (isMockFile) { // if this is mock file
                    isProcess = false; // dont' process it
                } else { // otherwise, for any non mock file
                    isProcess = true; // process this itself
                }       
            }

            if (isProcess) {
                const getModuleName = () => {
                    let fileName = (isMockFile ? path.basename(file.path, '.mock.js') : path.basename(file.path, '.js')),
                        namespace = '',
                        rootName = '',
                        items = file.path.split(path.sep),
                        startAt = items.lastIndexOf('members');
                    fileName = fileName.toLowerCase() === 'index' ? '' : fileName;
                    if (startAt > 0) {
                        for(let i = startAt + 1; i < items.length - 1; i++) {
                            namespace = (namespace ? (namespace + '.' + items[i]) : items[i]);
                        }
                    }
                    switch(root) {
                        case buildSettings.source.sys:
                            rootName = 'sys.'; break;
                        case buildSettings.source.web:
                            rootName = 'web.'; break;
                    }
                    return rootName + folder + (namespace ? ('.' + namespace) : '') + (fileName ? ('.' + fileName) : '');
                };
                let moduleName = getModuleName(),
                    pattern1 = new RegExp(/define\((?:\n|\s*)\[/), // define([... <-- with dependencies
                    pattern2 = new RegExp(/define\((?:\n|\s*)\(/), // define((... <-- without dependencies
                    content = file.contents.toString(),
                    asmId = root + folder,
                    asmUrl = root + folder + (isProd ? '/index.asm.min.js' : '/index.asm.js'); 
                
                // update content
                file.contents = Buffer.concat([
                    new Buffer(`\n// START: (${file.path})\n`),
                    (pattern1.test(content) ? 
                        new Buffer(file.contents.toString().replace(pattern1, "define('" + moduleName + "', [")) :
                        new Buffer(file.contents.toString().replace(pattern2, "define('" + moduleName + "', ("))),
                    new Buffer(`\n// END: (${file.path})\n`),
                ]);

                // add to packs (for bundle based resolving on client side)
                // remove "/modules/" because use() adds 'modules/' automatically when resolved
                let newAsmId = asmId.replace('/modules/', '/'),
                    newAsmUrl = asmUrl.replace('/modules/', '/'),
                    newModuleName = moduleName.replace('/modules/', '/');
                if (!asms.paths[newAsmId]) {
                    asms.paths[newAsmId] = newAsmUrl.replace('.js', ''); // requirejs automatically adds a .js
                    asms.bundles[newAsmId] = [];
                }
                asms.bundles[newAsmId].push(newModuleName);
            } else {
                file.contents = new Buffer(''); // empty string
            }
        };
    };
    const processAsm = (folder, _done) => {
        gulp.src(utils.getSource(root, folder, 'members/*.js', 'members/**/*.js'))
            // process content
            .pipe(gulpTap(processContent(folder)))
            .on('error', utils.errorHandler('processContent'))
            
            // compile 
            .pipe(babel(babelConfig))
            .on('error', utils.errorHandler('babel'))
            
            // check for issues
            .pipe(eslint('./build/.eslint.json'))
            // format errors, if any
            .pipe(eslint.format())
            // stop if errors
            .pipe(eslint.failAfterError())

            // inject content
            .pipe(injectFile())
            .on('error', utils.errorHandler('injectFile'))

            // concat into index.asm.js
            .pipe(concat(path.join(folder, 'index.asm.js')))
            .on('error', utils.errorHandler('concat'))
            
            // write to output
            .pipe(gulp.dest(root))
            .on('end', _done) 
            .on('error', utils.errorHandler('dest'));
    }
    const processAsms = (folders, onDone) => {
        let folder = folders.shift(); 
        if (folder) {
            processAsm(folder, () => {
                if (folders.length === 0) {
                    onDone();
                } else {
                    processAsms(folders, onDone);
                }
            });
        } else {
            onDone();
        }
    };
    processAsms(folders, whenDone); 
};
exports.assembler = function (isProd, isTest, asms, cb) {
    // note: server side assemblies (.app) are explicitely left as assembling is not required/not used
    let folders = [
        buildSettings.source.sys,
        buildSettings.source.web
    ];
    let doProcess = () => {
        if (folders.length === 0) { cb(); return; }
        let nextFolder = folders.shift();
        assembleFiles(isProd, isTest, asms, nextFolder, doProcess);
    };
    doProcess();
};