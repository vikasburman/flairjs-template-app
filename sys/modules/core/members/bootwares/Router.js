define([
    use('[Base]'),
    use('[IBootware]'),
    use(' | sys/core/libs/pathparser{.min}.js'),
    use('sys.core.comm.ServerRequest | sys.core.comm.ClientRequest'),
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
                mainModule = this.settings(':main', 'sample'),
                routesKey = (this.env.isServer ? ':routes.server' : ':routes.client');

            // each route definition (both on server and client) is as:
            // { "root":"", url": "", "verb": "", "class": "", "func": ""}
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
            routesKey = (this.env.isServer ? ':routes.server' : ':routes.client');
            routesOrder.unshift(this.env.isServer ? 'app.' + mainModule : 'web.' + mainModule); // add main module by default, on top both in server and client side
            routesOrder.unshift(this.assembly); // add sys.core (current module) by default, on top of main module, both in server and client side
            for(let routesOf of routesOrder) {
                routes = this.settings(routesOf + routesKey, []);
                for(let route of routes) {
                    if (route.url && route.class) {
                        fullUrl = (route.root || '') + route.url;
                        fullUrl = fullUrl.replace('//', '/');
                        if (this.env.isServer) {
                            if (route.func && route.verb) {
                                if (['get', 'post', 'put', 'delete'].indexOf(route.verb) === -1) { throw `Unknown verb for: ${route.url}`; }
                                router[route.verb](fullUrl, function(req, res) { // router here is express app.
                                    try {
                                        let handler = new Handler(route.class, route.func),
                                            request = new Request(handler, route.verb, req, res);
                                        handler.handle(request);
                                    } catch (err) {
                                        console.log(`Error handling ${fullUrl}. \n ${err}`);
                                        res.status(500).end();
                                    }
                                });
                                if (this.env.isDev) { console.log(route.verb + ': ' + fullUrl); }
                            } else {
                                 throw `Invalid route definiton: ${fullUrl}#${route.verb}`;
                            }
                        } else {
                            router.add(fullUrl, function() {
                                // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                let handler = new Handler(route.class, 'navigate'),
                                    request = new Request(handler, route.url, this);
                                try {
                                    handler.handle(request);
                                } catch (err) {
                                    console.log(`Error handling ${fullUrl}. \n ${err}`);
                                    throw err;
                                }
                            });
                            if (this.env.isDev) { console.log('navigate: ' + fullUrl); }
                        }
                    } else {
                        throw `Invalid route definiton: ${fullUrl}`;
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