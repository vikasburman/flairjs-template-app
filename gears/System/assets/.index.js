(() => {
    // if running on server
    const iServer = (typeof global === 'object' && typeof exports === 'object');

    // config
    const config = JSON.parse('<!-- inject: ../../../config.json -->');
    if (isServer) {
        global.config = config;
    } else {
        window.config = config;
    }

    // environment settings update
    config.env.isServer = isServer;

    // object weaving
    const weave = (obj) => {
        // TODO
        return obj;
    };

    // module export
    const getDefine = (isServer, realDefine) => {
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
                        for(let dep of arguments) { 
                            args.push(require(dep)); 
                        }
                    }
                }

                // weaving wrapper
                const wrappedFactory = () => {
                    return weave(factory.apply(_module, arguments));
                };
                        
                // exports weaved factory function
                _module.exports = wrappedFactory.apply(_module, args);
            };
        } else {
            proxyDefine = () => {
                let _object = null,
                    args = arguments,
                    factory = null,
                    i = 0;

                // get factory function and its position in arguments            
                for(let arg of args) { 
                    if (typeof arg === 'function') {
                        factory = arg; break;
                    }
                    i++;
                }

                // weaving wrapper
                const wrappedFactory = () => {
                    return weave(factory.apply(window, arguments));
                };
                args[i] = wrappedFactory;

                // define
                return realDefine.apply(window, args);
            };
        }

        // give it same interface as realDefine
        // e.g., define.amd and anything else that is not known now
        if (realDefine) {
            for(let p in realDefine) {
                if (realDefine.hasOwnProperty(p)) {
                    proxyDefine[p] = realDefine[p];
                }
            }
        }
        return proxyDefine; 
    };
    if (isServer) {
        global.define = getDefine(true, global.define);
    } else {
        window.define = getDefine(false, window.define);
    }    

    // module import
    const getInclude = (isServer) => {
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
                path = (!path ? './system/members/dummy.js' : path);
            }
            return path;
        };
        const getCatalogedPath = (path) => {

        };           
        const getRelativePath = (path, referredIn) => {

        };
        const getRedirectedPath = (path) => {

        };
        const getResolvedPath = (path) => {

        };
        
        return (path) => {
            // path can be:
            // (1) modules path
            //  *       --> to load node or preloaded/configured named/resolved named modules (e.g., fs, myCustomModule, system.view, app.orders, web.navigator, etc.)
            // (2) files path
            //  ./*     --> to load file relative to current path
            //  ../*    --> to load file relative to referenced path
            //  /*      --> to load file relative to root path
            // (3) injected path
            //  &*      --> to load appgears/client/server modules whose actual name is defined in catalog

            // * can be:
            // just a folder path that ends with /, in that case it will look for index.js file in that folder
            // can be a .js file, which will be loaded as is
            // can be a .json file, which will be loaded with a json! plugin on client and 
            // can be a .html file, which will be loaded with a text! plugin on client and
            // can be a .css file, which will be loaded with a css! plugin on client and
            // can be any other file type, which will be referred as is  

            // paths can be injected via catalog registry, so indirect loading can be done
            // any missing catalog entry will be resolved with a null value
            let firstChar = path.substr(0, 1);
            if (firstChar === '&') {
                path = getCatalogedPath(path);
            }

            // different paths can be defined for server and client as:
            // pathWhenOnServer | pathWhenOnClient
            // any missing will be resolved with a null value
            path = getContextualPath(path);

            // other cases
            firstChar = path.substr(0, 1);
            switch(firstChar) {
                case '.': // caters to patterns like ./, ../, ../../, etc.
                    let referredIn = (isServer ? arguments.callee.caller.arguments[2].id : '');
                    referredIn = (referredIn ? replaceAll(referredIn, '\\', '/') : '');
                    path = getRelativePath(path, referredIn); break;
                case '/':
                    path = getRootPath(path); break;
                default:
                    if (path.includes('<')) { // redirection
                        path = getRedirectedPath(path);
                    } else {
                        path = getResolvedPath(path);
                    }
            }
            return path;
        };
    };
    if (isServer) {
        global.include = getInclude(true);
    } else {
        window.include = getInclude(false);
    }    
})();