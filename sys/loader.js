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
    let isServer = (typeof global === 'object' && typeof exports === 'object') ? true : false;

    // config
    const config = JSON.parse(`{"settings":{"tabletWidth":{"min":600,"max":992}},"sys.core":{"catalog":{"Main":"app.main.Application | web.main.Application","Base":"sys.core.Base","Bootstrapper":"sys.core.boot.Server | sys.core.boot.Client"},"settings":{"port":{"dev":8080,"prod":8080},"ssl":{"public":"./cert.pem","private":"./key.pem"},"subdomains":{"www":{"response":{"headers":[{"name":"Access-Control-Allow-Credentials","value":true},{"name":"Access-Control-Allow-Origin","value":"*"},{"name":"Access-Control-Allow-Methods","value":"GET, PUT, POST, DELETE"},{"name":"Access-Control-Allow-Headers","value":"X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Request"}]}}},"bootwares":["sys.bootwares.server.Middlewares | sys.bootwares.client.Dependencies","sys.bootwares.server.Static | "]},"container":{}},"sys.bootwares":{"settings":{"middlewares":[{"name":"morgan","args":["dev"]},{"name":"compression"},{"name":"cookie-parser"}],"dependencies":[],"static":{"favIcon":"images/icon.png","caching":{"enabled":true,"age":86400000}}},"catalog":{},"container":{}},"source":{"sys":"sys/","app":"app/","web":"web/","www":"www/"}}`);
    config.env = {
        isServer: isServer,
        isDevice: false,
        isMobile: false,
        isTablet: false,
        isProd: false,
        isTest: false,
        isReady: false,
        root: (isServer ? (require('app-root-path') + '/') : '/'),
        require: {
            baseUrl: '/',
            paths: {
                text: './text.js',
                json: './json.js',
                css: './css.js'
            },
            bundles: {}
        }
    };
    Object.assign(config.env.require.paths, JSON.parse('{"sys/bootwares":"sys/bootwares/index.asm","sys/core":"sys/core/index.asm","web/main":"web/main/index.asm"}'));
    Object.assign(config.env.require.bundles, JSON.parse('{"sys/bootwares":["sys.bootwares.client.Dependencies","sys.bootwares.server.Middlewares","sys.bootwares.server.Static"],"sys/core":["sys.core.Base","sys.core.boot.Client","sys.core.boot.Server"],"web/main":["web.main.Application"]}'));
    if (!config.env.isServer) {
        if (window.document) {
            config.env.isDevice = (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1);
        }
        if (window.innerWidth <= config.settings.tabletWidth.min) {
            config.env.isMobile = true;
        } else if (window.innerWidth > config.settings.tabletWidth.min && window.innerWidth <= config.settings.tabletWidth.max) {
            config.env.isTablet = true;
        }
    }

    const dummyJS = './dummy.js';
    const catalog = {};
    const getNestedKeyValue = (obj, keyPath = '', defaultValue = null) => {
        let result = defaultValue,
            index = -1,
            pathArray = keyPath.split('.'),
            length = pathArray.length;
        while (obj != null && ++index < length) {
            result = obj = obj[pathArray[index]];
        };
        if (typeof result === 'undefined') { result = defaultValue; }
        return result;
    };

    /**
     * @global
     * @param {string} path - The path string that needs to be resolved.
     * @param {string} [as] - Environment to assume. ['server', 'client'] (for internal use only)
     * @return {string} The resolved path string that can be passed to require(...) and define(...) calls as is for loading required module.
     * @desc Resolve path from given path identifier.
     * @example
     * 1. Any module: 
     *    use('fs') --> 'fs'
     *
     * 2. Any file with relative path: 
     *    use('../../file1.js') --> '../../file1.js'
     *
     * 3. Any assembly member:
     *    use('sys.core.Base') --> 'sys/core/members/Base.js'
     *
     * 4. Any assembly file:
     *    use('app/main/assets/folder1/file1.png') --> 'app/main/assets/folder1/file1.png'
     *
     * 5. Any catalog injected member on this name:
     *    use('[Logger]') --> '...' (exact entry as specified in config file against 'Logger' catalog key)
     *
     * 6. Mock implementation of the assembly member when running in test mode, else member itself 
     *    use('~app.transactions.Payment')
     *      normally --> app/transactions/members/Payments.js
     *      when testing --> app/transactions/members/Payments.mock.js (this must exists when using ~ in path)
     *
     * 7. Conditional implementation for isomorphic members (that runs both on server and client)
     *    use('app.main.Server | web.main.Client') 
     *      when called on server: --> app/main/members/Server.js
     *      when called on client: --> web/main/members/Client.js
     */    
    const use = (_path, as) => {
        let isAsServer = isServer;
        if (as) {
            if (as === 'server') {
                isAsServer = true;
            } else if (as === 'client') {
                isAsServer = false;
            }
        }
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
                _path = (isAsServer ? parts[0] : parts[1]).trim();
                _path = _path || dummyJS;
            }
            return _path;
        };
        const getCatalogedPath = (_path) => {
            let key = _path.substr(1, _path.length - 2); // strip [ and ]
            return catalog[key] || dummyJS;
        };
        const getRelativePath = (_path) => {
            return _path; // requirejs/amdefine handles relative path with baseUrl automatically
        };
        const getAssemblyMemberPath = (_path, nsRoot, isMock) => {
            // for server sys.core.Base becomes sys/core/members/Base.js
            // for client it remains sys.core.Base and is loaded from corrosponding .asm file via requirejs bundle configuration
            if (isAsServer) {
                let parts = _path.split('.');
                parts.shift(); // remove sys    
                let asmName = parts.shift(); // remove assembly name
                _path =  config.env.root + nsRoot + asmName + '/members/' + parts.join('/') + (isMock ? '.mock.js' : '.js');
            }
            return _path;              
        };
        const getAssemblyFilePath = (_path, nsRoot) => {
            // for both server and client sys/core/**/*.* becomes sys/core/**/*.* (or if some other folder name is configured)
            let parts = _path.split('/');
            parts.shift(); // remove sys
            _path = nsRoot + parts.join('/');
            if (!isAsServer) { _path = '/' + _path; } // add root relativity
            if (!isAsServer) {
                if (_path.endsWith('.json')) {
                    _path = 'json!' + _path;
                } else if (_path.endsWith('.css')) {
                    _path = 'css!' + _path;
                } else if (_path.endsWith('.html')) {
                    _path = 'text!' + _path;
                }
            }
            return _path;
        };

        // path can be:
        // (1) node/require modules path
        //  *       --> to load preloaded/configured named/resolved named modules (e.g., fs, myCustomModule, etc.)
        // (2) relative files path
        //  ./*     --> to load file relative to current path
        //  ../*    --> to load file relative to referenced path
        //  /*      --> to load file relative to root path
        // (3) assembly files path
        //  {ns/}*  --> to reference files which are placed inside assembly folder (e.g., sys/core/assets/..., etc.)
        // (4) assembly members path
        //  {ns.}*  --> to load assembly  member (e.g., sys.Core.Base, app.main.start, web.main.start, etc.)
        //  ~{ns.}* --> to load assembly member's mock implementation when running in test mode
        //              a '~' as first character before any assembly member will get resolve to corrosponding
        //              mock file. e.g., '~app.main.start' will resolves to app/members/main/start.js normally, 
        //              however in test mode, this will be resolved to app/members/main/start.mock.js
        // (5) cataloged path
        //  [*]     --> to load namespaced modules whose actual name is defined in catalog registry

        // note:
        //  for any assembly .js file never define js file name. It will be reolved automatically
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
                    _path = config.env.root + _path; break;
            }
        }

        // type #4: assembly files path
        if (_path.startsWith('sys/')) {
            _path = getAssemblyFilePath(_path, config.source.sys);
        } else if (_path.startsWith('app/')) {
            _path = getAssemblyFilePath(_path, config.source.app);
        } else if (_path.startsWith('web/')) {
            _path = getAssemblyFilePath(_path, config.source.web);
        } else if (_path.startsWith('www/')) {
            _path = getAssemblyFilePath(_path, config.source.www);
        }

        // type #3: namespaced package members path
        if (_path.startsWith('sys.')) {
            _path = getAssemblyMemberPath(_path, config.source.sys, isMock);
        } else if (_path.startsWith('app.')) {
            _path = getAssemblyMemberPath(_path, config.source.app, isMock);
        } else if (_path.startsWith('web.')) {
            _path = getAssemblyMemberPath(_path, config.source.web, isMock);
        }

        // type #1, if nothing was of match OR processed result
        return _path;
    };

    /**
     * @global
     * @param {array} path - the path array of strings that needs to be 'required'.
     * @param {bool} [isReturnAsArray] - if included modules are returned as single array.
     * @return {promise} - promise object that will resolve after requiring paths.
     * @desc Require given module with a uniform syntax both on server and on client.
     * @example
     *    include(use('sys.core.Base'), use('sys.core.IBootware')], (Base, IBootware) => { });
     */       
    const include = (paths, isReturnAsArray = false) => {
        return new Promise((resolve, reject) => {
            if (paths.length > 0) {
                if (isServer) {
                    let items = [];
                    for(let path of paths) {
                        items.push(require(path));
                    }
                    if (isReturnAsArray) { 
                        resolve(items);
                    } else {
                        resolve(...items);
                    }
                } else {
                    require(paths, (...items) => {
                        if (isReturnAsArray) { 
                            resolve(items);
                        } else {
                            resolve(...items);
                        }                        
                    }, reject);
                }
            } else {
                resolve();
            }
        });
    };

     /**
     * @global
     * @param {string} key - which setting to read to. (format: [{assemblyPath}:]{settingKey})
     * @param {any} [defaultValue] - what value to return, if setting not found.
     * @return {any} - setting value.
     * @desc Reads setting value.
     * @example
     * 1. let value1 = settings('sys.core:level1');
     * 2. let value2 = settings('sys.core:level1.level2');
     * 3. let value3 = settings('level1.level2');
     */       
    const settings = (key, defaultValue = null) => {
        let obj = null;
        if (key.indexOf(':') !== -1) {
            let items = key.split(':'),
                asmKey = items[0],
                settingKey = items[1];
            key = settingKey;
            if (config[asmKey] && config[asmKey].settings) {
                obj = config[asmKey].settings;
            }
        } else {
            obj = config.settings;
        }
        if (!obj) { return defaultValue; }
        return getNestedKeyValue(obj, key, defaultValue);
    };

     /**
     * @global
     * @param {array} items - items array to async iterate to. 
     * @param {function} fn - async function to be called for each item.
     * @return {promise} - promise object which gets resolved when all items are iterated.
     * @desc Iterates on an array and call given async function for each item.
     * @example
     * forAsync(items, (resolve, reject, item) => { 
     *    // async operation on item
     *    // then resolve();
     * }).then(() => {
     *  // done
     * });
     */       
    const forAsync = (items, fn) => {
        return new Promise((resolve, reject) => {
            let doProcess = (item, onDone) => {
                let p = new Promise((_resolve, _reject) => {
                    fn(_resolve, _reject, item);                    
                });
                p.then(onDone).catch(reject);
            };
            let processItems = (items, onDone) => {
                let item = items.shift(); 
                if (item) {
                    doProcess(item, () => {
                        if (items.length === 0) {
                            onDone();
                        } else {
                            processItems(items, onDone);
                        }
                    });
                } else {
                    onDone();
                }
            };
            if (items.length > 0) {
                processItems(items.slice(), resolve);
            } else {
                resolve();
            }
        });
    };

    // expose this global API
    let g = (isServer ? global : window);
    g.config = config;
    g.use = use;
    g.include = include;
    g.settings = settings;
    g.forAsync = forAsync;

    // setup
    const loadScript = (src, success, error) => {
        let script = window.document.createElement('script');
        script.onload = success; script.onerror = error; script.src = src; 
        window.document.head.appendChild(script);
    };    
    const onError = (err) => { 
        if (!config.env.isProd) { 
            console.log(`boot failed. (${err.toString()})`); 
            console.log(err);
        }
    };
    const onDone = () => { 
        if (!config.env.isProd) { 
            console.log('boot success.'); 
        }
    };
    const onLoad = () => {
        if (isServer) {
            require('amdefine/intercept'); // define global 'define()'
        } else {
            require.config(config.env.require); // setup require config
        }
        include([use('./oojs.js | sys/oojs.js')]).then((oojs) => {
            // initialize OOJS
            let symbols = [];
            if (!config.env.isProd) { symbols.push('DEBUG'); }
            oojs({
                env: (isServer ? 'server' : 'client'),
                global: (isServer ? global : window),
                symbols: symbols
            });

            // build catalog to resolve names
            for(let asmKey in config) {
                if (config.hasOwnProperty(asmKey)) {
                    if (config[asmKey].catalog) {
                        for (let key in config[asmKey].catalog) {
                            if (config[asmKey].catalog.hasOwnProperty(key)) {
                                catalog[key] = config[asmKey].catalog[key]; // add or overwrite
                            }
                        }
                    }
                }
            }          

            // register container items from settings
            let items = [], names = [];
            for(let asmKey in config) {
                if (config.hasOwnProperty(asmKey)) {
                    if (config[asmKey].container) {
                        for (let item in config[asmKey].container) {
                            if (config[asmKey].container.hasOwnProperty(item)) {
                                items.push(item);
                                names.push(use(item));
                            }
                        }
                    }
                }
            }

            include(names).then((...members) => {
                let i = 0;
                for(let member of members) {
                    Container.register(items[i], member); i++;
                }

                // boot
                include([use('[Bootstrapper]')]).then((Bootstrapper) => {
                    let bootstrapper = new Bootstrapper();
                    bootstrapper.boot().then(() => {
                        if (isServer) {
                            bootstrapper.ready().then(onDone).catch(onError);
                        } else {
                            include(['sys/domReady.js']).then((domReady) => {
                                domReady(() => {
                                    bootstrapper.ready().then(onDone).catch(onError);
                                });
                            }).catch(onError);
                        }
                    }).catch(onError);
                }).catch(onError);
            }).catch(onError);
        }).catch(onError);
    };
    if (isServer) {
        onLoad();
    } else {
        loadScript('sys/require.js', onLoad, onError);
    }
})();