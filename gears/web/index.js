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
    let isServer = false;
    if (typeof IS_SERVER != 'undefined') { 
        isServer = IS_SERVER;
    } else {
        isServer = (typeof global === 'object' && typeof exports === 'object') ? true : false;
    }

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
            ]
        },
    
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
                        "use": true
                    }
                }
            }
        },
    
        "jasmine": {
            "browser": {
                "specRunner": {
                    "console": true
                },
                "headless": {
                    "port": 8080,
                    "catch": true,
                    "random": false,
                    "throwFailures": true
                }
            },
            "node": {
                "verbose": true,
                "includeStackTrace": true,
                "timeout": 5000,
                "errorOnFail": true
            }
        },
    
        "catalog": {
            "Base": "sys.core.Base",
            "Module": "sys.core.Module",
            "Bootware": "sys.core.Bootware",
            "Bootstrapper": "sys.core.boot.Server | sys.core.boot.Client",
            "Main": "app.main | web.main"
        },
    
        "weaving": {
    
        },
    
        "settings": {
            "sys.boot": {
                "bootwares": [
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
        isTest: true,
        root: '',
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
    Object.assign(config.env.require.bundles, JSON.parse('{"gears/modules/aop":["sys.aop.Base"],"gears/modules/core":["sys.core.Base","sys.core.Bootware","sys.core.Module","sys.core.boot.Client","sys.core.boot.Server"]}'));

    // update root
    const getRootPath = (_path) => {
        return (isServer ? (require('app-root-path')) :
                (document.location.protocol.toLowerCase() !== 'file:' ? '' :
                document.location.pathname.toLowerCase().replace(config.settings.indexHtml, '')) + _path);
    };     
    config.env.root = getRootPath('') + '/';

    // path resolver
    const dummyJS = '_dummy_';
    //define(dummyJS, () => { return null; });    
    const use = (_path) => {
        const escapeRegExp = (string) => {
            return string.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1');
        };
        const replaceAll = (string, find, replace) => {
            return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        };    
        const getContextualPath = (_path) => {
            let parts = null,
                dummy = '';
            if (_path.includes('|')) {
                parts = _path.split('|');
                _path = (isServer ? parts[0] : parts[1]).trim();
                _path = _path || dummyJS;
            }
            return _path;
        };
        const getCatalogedPath = (_path) => {
            let key = _path.substr(1, _path.length - 2); // strip [ and ]
            return config.catalog[key] || dummyJS;
        };
        const getRelativePath = (_path) => {
            return _path; // requirejs/amdefine handles relative path with baseUrl automatically
        };
        const getNamespacedPackageMemberPath = (_path, nsRoot, isMock) => {
            // for server sys.core.Base becomes gears/modules/core/members/Base.js
            // for client it remains sys.core.Base and is loaded from corrosponding .pack file via requirejs bundle configuration
            if (isServer) {
                let parts = _path.split('.');
                parts.shift(); // remove sys    
                let moduleName = parts.shift(); // remove module name
                _path =  config.env.root + nsRoot + moduleName + '/members/' + parts.join('/') + (isMock ? '.mock.js' : '.js');
        }
            return _path;              
        };
        const getNamespacedPackageFilePath = (_path, nsRoot) => {
            // for both server and client sys/core/**/*.* becomes gears/modules/core/**/*.*
            let parts = _path.split('/');
            parts.shift(); // remove sys
            _path = nsRoot + parts.join('/');
            return _path;
        };

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
        //  {ns.}*  --> to load namespaced package member (e.g., sys.Core.Base, app.main.start, web.main.start, etc.)
        //  ~{ns.}* --> to load namespaced package member's mock implementation when running in test mode
        //              a '~' as first character before any namespaced member will get resolve to corrosponding
        //              mock file. e.g., '~app.main.start' will resolves to app/modules/members/main/start.js normally, 
        //              however in test mode, this will be resolved to app/modules/members/main/start.mock.js
        // (5) cataloged path
        //  [*]     --> to load namespaced modules whose actual name is defined in catalog registry

        // note:
        //  for any packaged .js file never define js file name. It will be reolved automatically
        //  other than .js file, .json, .html, .css file types will get required special processing

        // type #5: cataloged path
        let firstChar = _path.substr(0, 1),
            lastChar = _path.substr(_path.length - 1, 1);
        if (firstChar === '[' && lastChar === ']') {
            _path = getCatalogedPath(_path);
        }

        // different paths can be defined for server and client as:
        // pathWhenOnServer | pathWhenOnClient
        // any missing will be resolved with a null value
        _path = getContextualPath(_path);

        // mocking consideration
        let isMock = false;
        if (_path.substr(0, 1) === '~') { // mock required in test mode
            _path = _path.substr(1); // strip this
            if (config.env.isTest) {
                isMock = true;
            }
        }

        // type #2: relative files path
        firstChar = _path.substr(0, 1);
        if (firstChar === '.' || '/') {
            switch(firstChar) {
                case '.': // caters to patterns like ./, ../, ../../, etc.
                    _path = getRelativePath(_path); break;
                case '/':
                    _path = getRootPath(_path); break;
            }
        }

        // type #4: namespaced package files path
        if (_path.startsWith('sys/')) {
            _path = getNamespacedPackageFilePath(_path, config.source.sys);
        } else if (_path.startsWith('app/')) {
            _path = getNamespacedPackageFilePath(_path, config.source.app);
        } else if (_path.startsWith('api/')) {
            _path = getNamespacedPackageFilePath(_path, config.source.api);
        } else if (_path.startsWith('web/')) {
            _path = getNamespacedPackageFilePath(_path, config.source.web);
        }

        // type #3: namespaced package members path
        if (_path.startsWith('sys.')) {
            _path = getNamespacedPackageMemberPath(_path, config.source.sys, isMock);
        } else if (_path.startsWith('app.')) {
            _path = getNamespacedPackageMemberPath(_path, config.source.app, isMock);
        } else if (_path.startsWith('api.')) {
            _path = getNamespacedPackageMemberPath(_path, config.source.api, isMock);
        } else if (_path.startsWith('web.')) {
            _path = getNamespacedPackageMemberPath(_path, config.source.web, isMock);
        }

        // type #1, if nothing was of match OR processed result
        return _path;
    };
    if (isServer) {
        global.use = use;
    } else {
        window.use = use;
    }

    // setup
    if (isServer) {
        require('amdefine/intercept'); // define global define
    } else {
        // setup require config
        require.config(config.env.require);
    }

    // boot (if not test mode)
    if (config.env.isTest) {
        // do nothing
    } else {
        const onError = (err) => { if (!config.env.isProd) { console.log(`boot failed. (${err.toString()})`); } };
        require([use('[Bootstrapper]')], (Bootstrapper) => {
            let bootstrapper = new Bootstrapper();
            bootstrapper.start().then(() => {
                if (!config.env.isProd) { console.log('boot success.'); }
            }).fail(onError)
        }, onError);
    }
})();