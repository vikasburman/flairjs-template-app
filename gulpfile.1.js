const fs = require('fs');
const del = require('del');
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
const injectFile = require('gulp-inject-file');
const babel = require('gulp-babel');
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
// all types of tasks in specific order for specified targets
const getAllTasks = (roots, ...taskCreators) => {
    let tasks = [];
    for(let root of roots) {
        for (let taskCreator of taskCreators) {
            let collectedTasks = taskCreator(root);
            if (collectedTasks) { tasks.push(collectedTasks); }          
        }
    }
    return tasks;
};

// task: clean (to delete all generated files)
const cleanGlob = [
    '/**/*.pack.js', 
    '/**/*.min.js', 
    '/**/*.min.css'
];
const cleanModules = (root) => {
    let folders = getFolders(root);
    if (folders.length <= 0) { return null; };
    return folders.map((folder) => {
      return del(getSource(root, folder, ...cleanGlob));
    });
};
gulp.task('clean', () => {
    let roots = [];
    if(config.build.sys) { roots.push(config.source.sys); }
    if(config.build.app) { roots.push(config.source.app); }
    if(config.build.web) { 
        roots.push(config.source.web); 
        roots.push(config.source.www.sys);
    }
    return getAllTasks(roots, cleanModules);
});

// task: process templates (to regenerate all templatzed files)
const processTemplates = (root) => {
    let folders = getFolders(root);
    if (folders.length <= 0) { return null; };
    const isJSFile = (file) => {
        return (file.path.toLowerCase().endsWith('.js.tmpl'));
    };
    return folders.map((folder) => {
        return gulp.src(getSource(root, folder, '/**/*.tmpl'))
            // inject content
            .pipe(injectFile())
            // inject header (for .js files only)
            .pipe(gulpIf(isJSFile, header(JSBanner, { pkg : pkg } )))
            // rename by removing .tmpl and leaving name as is    
            .pipe(rename((path) => {
                path.extname = ''; // from <name.whatever>.tmpl to <name.whatever>
            }))
            // write to output
            .pipe(gulp.dest(root))      
    });
};
gulp.task('processTemplates', () => {
    let roots = [];
    if(config.build.sys) { roots.push(config.source.sys); }
    if(config.build.app) { roots.push(config.source.app); }
    if(config.build.web) { 
        roots.push(config.source.web); 
        roots.push(config.source.www.sys);
    }
    return getAllTasks(roots, processTemplates);
});

// task: pack (to create bundled .pack.js files of all client visible modules)
const packs = {
    paths: {},
    bundles: {}
};
const packModules = (root) => {
    let folders = getFolders(root);
    if (folders.length <= 0) { return null; };
    const processContent = (folder) => {
        return (file, t) => {
            const getModuleName = () => {
                let fileName = path.basename(file.path, '.js'),
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
                packUrl = root + folder + '/index.pack.js'; 
            
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
        };
     };
    return folders.map((folder) => {
      return gulp.src(getSource(root, folder, 'members/*.js', '/members/**/*.js'))
        // process content
        .pipe(gulpTap(processContent(folder)))
        // check for issues
        .pipe(eslint('.eslint.json'))
        // format errors, if any
        .pipe(eslint.format())
        // stop if errors
        .pipe(eslint.failAfterError())
        // compile 
        .pipe(babel())
        // concat into index.pack.js
        .pipe(concat(path.join(folder, 'index.pack.js')))
        // write to output
        .pipe(gulp.dest(root))
        // minify
        .pipe(minifier(config.source.uglify.js, uglifyjs))
        // rename to index.pack.min.js
        .pipe(rename(path.join(folder, 'index.pack.min.js')))
        // inject header
        .pipe(header(JSBanner, { pkg : pkg } ))     
        // write to output again
        .pipe(gulp.dest(root));    
    });
};
gulp.task('pack', () => {
    let roots = [];
    // note: server side modules (.app) are explicitely left as packing is not required/not used
    if(config.build.sys) { roots.push(config.source.sys); }
    if(config.build.web) { roots.push(config.source.web); }
    return getAllTasks(roots, packModules);
});
gulp.task('env', (done) => {
    console.log(packs);
    done();
});


//TODO: html templates compressor and css lint and minify is to be added
// need to think about their deployment as well

// // CSSLint
// gulp.task('css:lint', () => {
//     return gulp.src(cssFiles)
//         .pipe(csslint('.csslint.json'))
//         .pipe(csslint.failFormatter());
// });

gulp.task('default', (cb) => {
    runSequence('clean', 'processTemplates', 'pack', 'env', cb);
});