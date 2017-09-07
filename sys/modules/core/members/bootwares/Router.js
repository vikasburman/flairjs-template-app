define([
    use('[Base]'),
    use('[IBootware]'),
    use(' | sys/core/libs/pathparser{.min}.js'),
    use('app.core.comm.ServerRequest | sys.core.comm.ClientRequest'),
    use('sys.core.comm.Handler')
], (Base, IBootware, RouteManager, Request, Handler) => {
    /**
     * @class sys.core.bootwares.Router
     * @classdesc sys.core.bootwares.Router
     * @desc Configure server/client side routes.
     */    
    return Class('sys.core.bootwares.Router', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let routesOrder = [],
                routes = [],
                router = (this.env.isServer ? app : new RouteManager({})),
                fullUrl = '',
                routesKey = (this.env.isServer ? ':routes.server' : ':routes.client'),
                apiPrefix = (this.env.isServer ? this.settings('api.root', '') : ''),
                versionPrefix = (this.env.isServer ? this.settings('api.version', '') : '');

            const getHandler = (fullUrl, route) => {
                return function(req, res) { // router here is express app.
                    xLog('debug', `route hit: ${fullUrl}`);
                    try {
                        let handler = new Handler(route.class, route.func),
                            request = new Request(handler, route.verb, req, res);
                        handler.handle(request);
                    } catch (err) {
                        this.onError(err, `Error handling ${fullUrl}.`);
                        res.status(500).end();
                    }
                }
            };

            // each route definition (both on server and client) is as:
            // { "ver":"1", "root":"", url": "", "verb": "", "class": "", "func": ""}
            // ver: 
            //  on server, this represents version of the api
            //  on client, this is not required
            // root: root path under which given url to hook to
            // url: url pattern to match
            // verb: 
            //  on server, these can be: "get", "post", "put", "delete"
            //  on client, this is not required
            // class: 
            //  on server, the class that can handle this route
            //  on client, the view class that represents this route
            // func: 
            //  on server, the function name of the class that handles this
            //  on client, this is fixed as 'navigate'
            routesOrder = this.settings(routesKey);
            routesOrder.unshift(this.env.getMainModule()); // add main module by default, on top both in server and client side
            routesOrder.unshift((this.env.isServer ? 'app.core' : 'web.core')); // add app.core or web.core by default, on top of main module, both in server and client side
            for(let routesOf of routesOrder) {
                xLog('debug', `routes of: ${routesOf}`);
                routes = this.settings(routesOf + routesKey, []);
                for(let route of routes) {
                    if (route.url && route.class) {
                        fullUrl = (route.root || '') + route.url;
                        fullUrl = fullUrl.replace('//', '/');
                        if (this.env.isServer) {
                            if (apiPrefix) { fullUrl = apiPrefix + '/' + versionPrefix + (route.ver || "1") + fullUrl; }
                            if (route.func && route.verb) {
                                if (['get', 'post', 'put', 'delete'].indexOf(route.verb) === -1) { throw `Unknown verb for: ${route.url}`; }
                                router[route.verb](fullUrl, getHandler(fullUrl, route));
                                xLog('debug', `  ${route.verb}: ${fullUrl}`);
                            } else {
                                let err = `Invalid route definiton: ${fullUrl}#${route.verb}`;
                                xLog('error',  err);
                                throw err;
                            }
                        } else {
                            router.add(fullUrl, function() {
                                // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                let handler = new Handler(route.class, 'navigate'),
                                    request = new Request(handler, route.url, this);
                                try {
                                    handler.handle(request);
                                } catch (err) {
                                    this.onError(err, `Error handling ${fullUrl}.`);
                                    throw err;
                                }
                            });
                            xLog('debug', `  navigate: ${fullUrl}`);
                        }
                    } else {
                        let err = `Invalid route definiton: ${fullUrl}`;
                        xLog('error',  err);
                        throw err;
                    }
                }
            }

            // setup hash change trigger on client
            if (!this.env.isServer) {
                window.onhashchange = () => {
                    let url = window.location.hash;
                    if (url.substr(0, 1) === '#') { url = url.substr(1); }
                    router.run(url);
                };
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);        
    });
});