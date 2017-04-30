/** 
 * appgears - Unified application framework for JavaScript
 * @copyright (C) 2017
 * @version v0.1.0
 * @link 
 * @license MIT
 *
 * (powered by appgears - https://github.com/vikasburman/appgears)
 */
(() => {
    const iServer = (typeof global === 'object' && typeof exports === 'object');
    const dummyJS = '_dummy_';

    // config
    const config = JSON.parse(`{
        "source": {
            "sys": "gears/modules/",
            "app": "app/modules/",
            "api": "api/modules/",
            "web": "web/modules/",
            "www": {
                "sys": "gears/web/",
                "web": "web/"
            },
            "exclude": [
                "assets/**",
                "libs/**",
                "tests/**"
            ],
            "uglify": {
                "js": {
                    "mangle": false,
                    "preserveComments": "license",
                    "output": {
                    },
                    "compress": {
                        "dead_code": true,
                        "drop_debugger": true,
                        "global_defs": {
                        }
                    }
                }
            }
        },
    
        "catalog": {
            "Base": "sys.core.Base",
            "Boot": "sys.core.Server | sys.core.Client",
            "Main": "app.main | web.main"
        },
    
        "weaving": {
    
        },
    
        "settings": {
            "sys.core": {
                "bootwares": [
                    "[Main]"
                ]
            }
        }
    }`);
    if (isServer) {
        global.config = config;
    } else {
        window.config = config;
    }

    // set env
    config.env = {
        isServer: isServer,
        isProd: false,
        require: {
            baseUrl: '/',
            paths: {
                text: 'libs/require/text.js',
                json: 'libs/require/json.js',
                css: 'libs/require/css.js',
                domReady: 'libs/require/domReady.js'
            },
            bundles: {}
        }
    };

    // update paths and bundles
    Object.assign(config.env.require.paths, JSON.parse('{"gears/modules/aop":"gears/modules/aop/index.pack.js","gears/modules/core":"gears/modules/core/index.pack.js"}'));
    Object.assign(config.env.require.bundles, JSON.parse('{"gears/modules/aop":["sys.aop.Base"],"gears/modules/core":["sys.core.Base","sys.core.Client","sys.core.Module","sys.core.Server"]}'));

    // env path resolver
    config.env.path = () => {
        const escapeRegExp = (string) => {
            return string.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1');
        };
        const replaceAll = (string, find, replace) => {
            return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        };
        const getRootPath = (path) => {
            return (isServer ? (require('app-root-path')) :
                    (document.location.protocol.toLowerCase() !== 'file:' ? '' :
                     document.location.pathname.toLowerCase().replace(config.settings.indexHtml, '')) + path);
        };     
        const getContextualPath = (path) => {
            let parts = null,
                dummy = '';
            if (path.includes('|')) {
                parts = path.split('|');
                path = (isServer ? parts[0] : parts[1]).trim();
                path = path || dummyJS;
            }
            return path;
        };
        const getCatalogedPath = (path) => {
            let key = path.substr(1, path.length - 2); // strip [ and ]
            return config.catalog[key] || dummyJS;
        };
        const getRelativePath = (path, referredIn) => {
            if (isServer) {
                referredIn = (referredIn ? replaceAll(referredIn, '\\', '/') : '');
                path = referredIn.substr(0, referredIn.lastIndexOf('/') + 1) + path.substr(2); // after ./
            }
            return path; // requirejs handles relative path with baseUrl automatically
        };
        const getNamesacedPackageMemberPath = (path, nsRoot) => {
            // for server sys.core.Base becomes gears/modules/core/members/Base.js
            // for client it remains sys.core.Base and is loaded from corrosponding .pack file via requirejs bundle configuration
            if (isServer) {
                let parts = path.split('.').shift(), // remove sys
                    moduleName = parts.shift(), // remove module name
                path = nsRoot + moduleName + '/members/' + parts.join('/') + '.js';
            }
            return path;            
        };
        const getNamesacedPackageFilePath = (path, nsRoot) => {
            // for both server and client sys/core/**/*.* becomes gears/modules/core/**/*.*
            let parts = path.split('/').shift(); // remove sys
            path = nsRoot + parts.join('/');
            return path;
        };

        return (path) => {
            // path can be:
            // (1) node/require modules path
            //  *       --> to load preloaded/configured named/resolved named modules (e.g., fs, myCustomModule, etc.)
            // (2) relative files path
            //  ./*     --> to load file relative to current path
            //  ../*    --> to load file relative to referenced path
            //  /*      --> to load file relative to root path
            // (3) appgears packaged files path
            //  {ns/}*  --> to reference files which are placed inside appgears module folder (e.g., sys/core/assets/..., etc.)
            // (4) appgears packaged members path
            //  {ns.}*  --> to load namespaced package members (e.g., sys.Core.Base, app.main, web.main.start, etc.)
            // (5) cataloged path
            //  [*]     --> to load namespaced modules whose actual name is defined in catalog registry

            // note:
            //  for any packaged .js file never define js file name. It will be reolved automatically
            //  other than .js file, .json, .html, .css file types will get required special processing

            // type #5: cataloged path
            let firstChar = path.substr(0, 1),
                lastChar = path.substr(path.length - 1, 1);
            if (firstChar === '[' && lastChar === ']') {
                path = getCatalogedPath(path);
            }

            // different paths can be defined for server and client as:
            // pathWhenOnServer | pathWhenOnClient
            // any missing will be resolved with a null value
            path = getContextualPath(path);

            // type #4: namespaced package files path
            if (path.startsWith('sys/')) {
                path = getNamesacedPackageFilePath(path, config.source.sys);
            } else if (path.startsWith('app/')) {
                path = getNamesacedPackageFilePath(path, config.source.app);
            } else if (path.startsWith('web/')) {
                path = getNamesacedPackageFilePath(path, config.source.web);
            }

            // type #3: namespaced package members path
            if (path.startsWith('sys.')) {
                path = getNamesacedPackageMemberPath(path, config.source.sys);
            } else if (path.startsWith('app.')) {
                path = getNamesacedPackageMemberPath(path, config.source.app);
            } else if (path.startsWith('web.')) {
                path = getNamesacedPackageMemberPath(path, config.source.web);
            }

            // type #2: relative files path
            firstChar = path.substr(0, 1);
            if (firstChar === '.' || '/') {
                switch(firstChar) {
                    case '.': // caters to patterns like ./, ../, ../../, etc.
                        let referredIn = (isServer ? arguments.callee.caller.arguments[2].id : '');
                        path = getRelativePath(path, referredIn); break;
                    case '/':
                        path = getRootPath(path); break;
                }
            }

            // type #1, if nothing was of match OR processed result
            return path;
        };
    };

    // module export and import
    const getDefine = (realDefine) => {
        // get proxyDefine as per context
        let proxyDefine = null;
        if (isServer) {
            proxyDefine = () => {
                // this gives access to module object of the file which is calling this function
                let _module = arguments.callee.caller.arguments[2],
                    args = [],
                    factory = null;
                    
                // get factory function, name and deps     
                for(let arg of arguments) { 
                    if (typeof arg === 'function') {
                        factory = arg; 
                    } else if (typeof arg === 'string') { 
                        _module.id = arg; 
                    } else { // must be array, require all dependencies                    
                        for(let dep of arg) { 
                            args.push(require(config.env.path(dep))); 
                        }
                    }
                }

                // exports factory function
                _module.exports = factory.apply(_module, args);
            };
        } else {
            proxyDefine = () => {
                let args = [];

                // get factory function, name and deps     
                for(let arg of arguments) { 
                    if (typeof arg === 'function') {
                        args.push(factory);
                    } else if (typeof arg === 'string') {
                        args.push(arg);
                    } else { // must be array, resolve path of all dependencies                    
                        for(let dep of arg) { 
                            args.push(config.env.path(dep));
                        }
                    }
                }

                // define
                return realDefine.apply(window, args);
            };
        }

        // give it same interface as realDefine
        // e.g., define.amd and anything else that is not known now
        if (realDefine) {
            Object.assign(proxyDefine, realDefine);
        }
        return proxyDefine;
    };
    const include = (deps, onSuccess, onError) => {
        let i = 0;
        for(let dep of deps) {
            deps[i] = config.env.path(dep);
            i++;
        }
        return require(deps, onSuccess, onError);
    };
    if (isServer) {
        global.define = getDefine(global.define);
        global.include = include;
    } else {
        window.define = getDefine(window.define);
        window.include = include;
    }

    // define dummy module
    define(dummyJS, () => { return null; });

    // start
    if (isServer) {

    } else { // client
        // setup require config
        require.config(config.env.require);

        // boot
        const onError = (err) => {
            console.log(`boot failed. (${err.toString()})`);
        };
        include(['[Boot]'], (boot) => {
            boot().then(() => {
                console.log('boot success.');
            }).fail(onError)
        }, onError);        
    }
})();