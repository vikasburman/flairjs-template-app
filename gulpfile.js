const fs = require('fs');
const del = require('del');
const process = require('process');
const path = require('path');
const merge = require('merge-stream');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglifyjs = require('uglify-js-harmony')
const uglify = require('gulp-uglify');
const minifier = require('gulp-uglify/minifier');
const rename = require('gulp-rename');
const gulpIf = require('gulp-if');
const gulpTap = require('gulp-tap');
const header = require('gulp-header');
const jasmineNode = require('gulp-jasmine');
const injectFile = require('gulp-inject-file');
const injectString = require('gulp-inject-string');
const babel = require('gulp-babel');
const gulpJsdoc = require('gulp-jsdoc3');
const config = JSON.parse(fs.readFileSync('config.json').toString());
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
const pkg = require('./package.json');
let isProd = false;
let isTest = false;

// get folders under given root
const getFolders = (root) => {
    const _getFolders = () => {
        return fs.readdirSync(root)
            .filter((file) => {
                return fs.statSync(path.join(root, file)).isDirectory();
        });
    }
    return ['/'].concat(_getFolders());
};
// get source excluding configured ones
const getSource = (root, folder, ...patterns) => {
    let src = [];
    for(let incGlob of patterns) {
        src.push(path.join(root, folder, incGlob));
    }
    if (config.source.exclude) {
        for(let exGlob of config.source.exclude) {
            src.push('!' + path.join(root, folder, exGlob));
        }
    }
    return src;
};
// error handler
const errorHandler = (name) => {
    return function (err) {
        console.error('Error in task: ' + name);
        console.error('Error: ' + err.toString());
    };
};

// task: clean (to delete all generated files)
const cleanGlob = [
    '/**/*.pack.js', 
    '/**/*.set.js',
    '/**/*.min.js', 
    '/**/*.min.css'
];
const cleanModules = (root) => {
    let folders = getFolders(root);
    for(folder of folders) {
        del.sync(getSource(root, folder, ...cleanGlob));
    }
};
gulp.task('clean', (done) => {
    cleanModules(config.source.sys);
    cleanModules(config.source.app);
    cleanModules(config.source.api);
    cleanModules(config.source.web);
    cleanModules(config.source.www.sys);
    done();
});

// task: process templates (to regenerate all templatzed files)
const processTemplates = (root, whenDone) => {
    let folders = getFolders(root);
    const isJSFile = (file) => {
        return (file.path.toLowerCase().endsWith('.js.tmpl'));
    };
    const processFolder = (folder, _done) => {
        gulp.src(getSource(root, folder, '/**/*.tmpl'))
            // inject content
            .pipe(injectFile())
            .on('error', errorHandler('injectFile'))
            // handle loading .min version
            .pipe(gulpIf(isProd, injectString.replace('{.min}', '.min'), injectString.replace('{.min}', '')))
            .on('error', errorHandler('injectString'))
            // inject header (for .js files only)
            .pipe(gulpIf(isJSFile, header(JSBanner, { pkg : pkg } )))
            .on('error', errorHandler('header'))
            // rename by removing .tmpl and leaving name as is    
            .pipe(rename((path) => {
                path.extname = ''; // from <name.whatever>.tmpl to <name.whatever>
            }))
            .on('error', errorHandler('rename'))
            // write to output
            .pipe(gulp.dest(root + folder))
            .on('end', _done)
            .on('error', errorHandler('dest'));
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
gulp.task('processTemplates', (done) => {
    processTemplates(config.source.sys, () => {
        processTemplates(config.source.app, () => {
            processTemplates(config.source.api, () => {
                processTemplates(config.source.web, () => {
                    processTemplates(config.source.www.sys, () => {
                        done();
                    });
                });
            });     
        });
    });
});

// task: pack (to create .pack.js files of all client visible modules)
const packs = {
    paths: {},
    bundles: {}
};
const packModules = (root, whenDone) => {
    let folders = getFolders(root);
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
                        case config.source.sys:
                            rootName = 'sys.'; break;
                        case config.source.web:
                            rootName = 'web.'; break;
                    }
                    return rootName + folder + (namespace ? ('.' + namespace) : '') + (fileName ? ('.' + fileName) : '');
                };
                let moduleName = getModuleName(),
                    pattern1 = new RegExp(/define\((?:\n|\s*)\[/), // define([... <-- with dependencies
                    pattern2 = new RegExp(/define\((?:\n|\s*)\(/), // define((... <-- without dependencies
                    content = file.contents.toString(),
                    packId = root + folder,
                    packUrl = root + folder + (isProd ? '/index.pack.min.js' : '/index.pack.js'); 
                
                // update content
                file.contents = Buffer.concat([
                    new Buffer(`\n// START: (${file.path})\n`),
                    (pattern1.test(content) ? 
                        new Buffer(file.contents.toString().replace(pattern1, "define('" + moduleName + "', [")) :
                        new Buffer(file.contents.toString().replace(pattern2, "define('" + moduleName + "', ("))),
                    new Buffer(`\n// END: (${file.path})\n`),
                ]);

                // add to packs (for bundle based resolving on client side)
                if (!packs.paths[packId]) {
                    packs.paths[packId] = packUrl;
                    packs.bundles[packId] = [];
                }
                packs.bundles[packId].push(moduleName);
            } else {
                file.contents = new Buffer(''); // empty string
            }
        };
    };
    const processModule = (folder, _done) => {
        gulp.src(getSource(root, folder, 'members/*.js', 'members/**/*.js'))
            // process content
            .pipe(gulpTap(processContent(folder)))
            .on('error', errorHandler('processContent'))
            // check for issues
            .pipe(eslint('.eslint.json'))
            // format errors, if any
            .pipe(eslint.format())
            // stop if errors
            .pipe(eslint.failAfterError())
            // compile 
            .pipe(babel())
            .on('error', errorHandler('babel'))
            // concat into index.pack.js
            .pipe(concat(path.join(folder, 'index.pack.js')))
            .on('error', errorHandler('concat'))
            // write to output
            .pipe(gulp.dest(root))
            .on('end', _done) 
            .on('error', errorHandler('dest'));
    }
    const processModules = (folders, onDone) => {
        let folder = folders.shift(); 
        if (folder) {
            processModule(folder, () => {
                if (folders.length === 0) {
                    onDone();
                } else {
                    processModules(folders, onDone);
                }
            });
        } else {
            onDone();
        }
    };
    processModules(folders, whenDone);
};
gulp.task('pack', (done) => {
    // note: server side modules (.app and .api) are explicitely left as packing is not required/not used
    packModules(config.source.sys, () => {
        packModules(config.source.web, () => {
            done();
        });
    });
});

// pack:sets
const packSets = (root, whenDone) => {
    let folders = getFolders(root);
    const processContent = (folder) => {
        return (file, t) => {
            let target = path.join(root, folder, 'index.pack.js');
            // append file content into target
            fs.appendFileSync(target,  Buffer.concat([
                new Buffer(`\n\n// START: (${file.path})\n`),
                file.contents,
                new Buffer(`\n// END: (${file.path})\n`),
                ])
            );
        };
    };
    const processModule = (folder, _done) => {
        gulp.src(getSource(root, folder, '*.set.js'))
            // append into index.pack.js
            .pipe(gulpTap(processContent(folder)))
            // write to output
            .pipe(gulp.dest(root + folder))
            .on('end', _done) 
            .on('error', _done);
    }
    const processModules = (folders, onDone) => {
        let folder = folders.shift(); 
        if (folder) {
            processModule(folder, () => {
                if (folders.length === 0) {
                    onDone();
                } else {
                    processModules(folders, onDone);
                }
            });
        } else {
            onDone();
        }
    };
    processModules(folders, whenDone);
};
gulp.task('pack:sets', (done) => {
    // note: server side modules (.app and .api) are explicitely left as packing is not required/not used
    packSets(config.source.sys, () => {
        packSets(config.source.web, () => {
            done();
        });
    });
});

// task: compress
const compressFiles = (root, whenDone) => {
    let folders = getFolders(root);
    const uglifyConfig = require('./.uglify.json');
    const processFile = (folder, _done) => {
        gulp.src(getSource(root, folder, '/**/*.pack.js', '/**/*.set.js'))
            // minify
            .pipe(minifier(uglifyConfig.js, uglifyjs))
            .on('error', errorHandler('minifier'))
            // rename 
            .pipe(rename((path) => {
                path.extname = '.min.js'; // from <name.whatever>.js to <name.whatever>.min.js
            }))
            .on('error', errorHandler('rename'))
            // write to output again
            .pipe(gulp.dest(root + folder))
            .on('end', _done)
            .on('error', errorHandler('dest'));
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
gulp.task('compress', (done) => {
    // note: server side modules (.app and .api) are explicitely left as compressing is not required/not used
    compressFiles(config.source.sys, () => {
        compressFiles(config.source.www.sys, () => {
            compressFiles(config.source.web, () => {
                done();
            });
        });
    });
});

// task: write env file
gulp.task('env', (done) => {
    let fileName = config.source.www.sys + 'index.js',
        fileContent = fs.readFileSync(fileName).toString();
    fileContent = fileContent.replace('[%]PROD[%]', isProd.toString());
    fileContent = fileContent.replace('[%]TEST[%]', isTest.toString());
    fileContent = fileContent.replace('[%]PATHS[%]', JSON.stringify(packs.paths));
    fileContent = fileContent.replace('[%]BUNDLES[%]', JSON.stringify(packs.bundles));
    fs.writeFileSync(fileName, fileContent);

    // copy it to node_modules for easy reference when running tests
    fs.writeFileSync('node_modules/gears-env.js', fileContent);

    // done
    done();
});

// task: test
gulp.task('test:all', (done) => {
    const jasminConfig = require('./.jasmine.json'),
        tests = [
            require('app-root-path') + '/' + config.source.www.sys + 'index.js',
            config.source.sys + '**/tests/*.spec.js',
            config.source.app + '**/tests/*.spec.js',
            config.source.api + '**/tests/*.spec.js',
            config.source.web + '**/tests/*.spec.js',
            config.source.www.sys + '**/tests/*.spec.js',
            config.source.www.web + '**/tests/*.spec.js'                          
    ];
    gulp.src(tests)
        .pipe(jasmineNode(jasminConfig))
        .on('end', done)
        .on('error', errorHandler('jasmine'));
    // HACK: pipe() is not exising and hence end/error done() is not called via pipe, 
    // so calling done() manually below - this seems to be working so far
    // but need to be revisited for a better solution
    done(); 
});
gulp.task('test', (cb) => {
    isProd = false;
    isTest = true;
    runSequence('clean', 'processTemplates', 'env', 'test:all', cb);
});

// task: docs
gulp.task('docs', (done) => {
    const jsdocsConfig = require('./.jsdocs.json'),
        docs = [
            'README.md',
            config.source.sys + '**/members/*.js',
            config.source.sys + '**/members/**/*.js'
        ];
    gulp.src(docs, {read: false})
        .pipe(gulpJsdoc(jsdocsConfig, done))
        .on('error', errorHandler('jsdocs'));
});

// task: build (dev)
gulp.task('build', (cb) => {
    isProd = false;
    isTest = false;
    runSequence('clean', 'processTemplates', 'pack', 'pack:sets', 'env', 'docs', cb);
});

// task: build (prod)
//TODO: html templates compressor and css lint and minify is to be added
// need to think about their deployment as well
gulp.task('build-prod', (cb) => {
    isProd = true;
    isTest = false;
    runSequence('clean', 'processTemplates', 'pack', 'pack:sets', 'compress', 'env', 'docs', cb);
});

// task: default
gulp.task('default', () => {
});