define([
    use('[Base]'),
    use('[IBootware]'),
    use('express | sys/core/libs/pathparser{.min}.js'),
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
                router = (this.env.isServer ? RouteManager.Router() : new RouteManager({})),
                theRoute = null,
                routesKey = (this.env.isServer ? ':routesOrder.server' : ':routesOrder.client');

            // each route definition (both on server and client) is as:
            // { "url": "", "verb": "", "class": "", "func": ""}
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
            routesOrder.unshift(this.assembly); // add sys.core by default, on top both in server and client side
            for(let routesOf of routesOrder) {
                routes = this.settings(routesOf + routesKey, []);
                for(let route of routes) {
                    if (route.url && route.class) {
                        if (this.env.isServer) {
                            if (route.func && route.verb) {
                                theRoute = router.route(route.url);
                                if (['get', 'post', 'put', 'delete'].indexOf(route.verb) === -1) { throw `Unknown verb for: ${route.url}`; }
                                theRoute[route.verb]((req, res) => { 
                                    let request = new Request(route.verb, req, res),
                                        handler = new Handler(route.class, route.func);                                    
                                    handler.handle(request).catch((err) => {
                                        throw err;
                                    })
                                });
                            } else {
                                 throw `Invalid route definiton: ${url}#${verb}`;
                            }
                        } else {
                            router.add(route.url, function() {
                                // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                let request = new Request(route.url, this),
                                    handler = new Handler(route.class, 'navigate');
                                handler.handle(request).catch((err) => {
                                    throw err;
                                })
                            });
                        }
                    } else {
                        throw `Invalid route definiton: ${url}#${verb}`;
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