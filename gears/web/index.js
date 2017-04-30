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
    // if running on server
    const iServer = (typeof global === 'object' && typeof exports === 'object');

    // config
    const config = JSON.parse(`{
        "source": {
            "sys": "gears/modules/",
            "app": "app/modules/",
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
            "Main": "app.main | web.main"
        },
    
        "weaving": {
    
        },
    
        "settings": {
            "sys.core": {
                "bootwares": [
                    "sys.Server | sys.Client",
                    "app.main | web.main"
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
            paths: JSON.parse('{"gears/modules/aop":"gears/modules/aop/index.pack.js","gears/modules/core":"gears/modules/core/index.pack.js"}'),
            bundles: JSON.parse('{"gears/modules/aop":["sys.aop.Base"],"gears/modules/core":["sys.core.Base","sys.core.Module"]}')
        }
    }

    // path resolver
    config.env.path = () => {
        const dummyJS = config.source.www.system + 'dummy.js';
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
            return path; // TODO:
        };
        const getNamesacedPackageMemberPath = (path, nsRoot) => {
            // for server sys/core/**/*.* becomes gears/modules/core/**/*.*
            // for client sys/core/**/*.* becomes gears/aop
            if (isServer) {
                let parts = path.split('.').shift(), // remove sys
                    moduleName = parts.shift(), // remove module name
                path = nsRoot + moduleName + '/members/' + parts.join('/') + '.js';
            }
            return path;
        };
        const getNamesacedPackageFilePath = (path, nsRoot) => {
            // for server sys.core.Base becomes gears/modules/core/members/Base.js
            // for client it remains sys.core.Base and is loaded from corrosponding .pack file via requirejs bundle configuration
            if (isServer) {
                let parts = path.split('.').shift(), // remove sys
                    moduleName = parts.shift(), // remove module name
                path = nsRoot + moduleName + '/members/' + parts.join('/') + '.js';
            }
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
            // (3) appgears packaged members path
            //  {ns.}*  --> to load namespaced package members (e.g., sys.Core.Base, app.main, web.main.start, etc.)
            // (4) appgears packaged files path
            //  {ns/}*  --> to reference files which are placed inside appgears module folder (e.g., sys/core/assets/..., etc.)
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

            // type #3: namespaced package members path
            if (path.startsWith('sys.')) {
                path = getNamesacedPackageMemberPath(path, config.source.sys);
            } else if (path.startsWith('app.')) {
                path = getNamesacedPackageMemberPath(path, config.source.app);
            } else if (path.startsWith('web.')) {
                path = getNamesacedPackageMemberPath(path, config.source.web);
            }

            // type #4: namespaced package files path
            if (path.startsWith('sys/')) {

            } else if (path.startsWith('app/')) {
                
            } else if (path.startsWith('web/')) {
                
            }

            // type #2: relative files path
            firstChar = path.substr(0, 1);
            if (firstChar === '.' || '/') {
                switch(firstChar) {
                    case '.': // caters to patterns like ./, ../, ../../, etc.
                        let referredIn = (isServer ? arguments.callee.caller.arguments[2].id : '');
                        referredIn = (referredIn ? replaceAll(referredIn, '\\', '/') : '');
                        path = getRelativePath(path, referredIn); break;
                    case '/':
                        path = getRootPath(path); break;
                }
            }


            return path;
        };
    };

    // module export
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
    if (isServer) {
        global.define = getDefine(global.define);
    } else {
        window.define = getDefine(window.define);
    }

    // start
    if (isServer) {

    } else {

    }
})();