define([
    use('[Base]'),
    use('[IBootware]'),
    use('express | sys/core/libs/pathparser{.min}.js')
], (Base, IBootware, RouteManager) => {
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
                routesKey = (this.env.isServer ? ':routesOrder.server' : ':routesOrder.client'),
                theHandler = (url, verb, cls, func, req, res) => {
                    include([use(cls)]).then((Handler) => {
                        let handler = new Handler(),
                            handlerInfo = Reflector.get(handler),
                            funcInfo = handlerInfo.getMember(func);
                        if (!!funcInfo || funcInfo.getMemberType() !== 'func' || !funcInfo.hasAttribute('endpoint')) {
                            throw `Invalid handler endpoint for: ${url}#${verb}`;
                        }
                        handler[func](req, res);
                    }).catch((err) => { throw err; });
                };

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
            //  on client, this is fixed as 'mount'
            routesOrder = this.settings(routesKey);
            for(let routesOf of routesOrder) {
                routes = this.settings(routesOf + routesKey, []);
                for(let route of routes) {
                    if (route.url && route.class && route.func) {
                        if (this.env.isServer) {
                            theRoute = router.route(route.url);
                            if (['get', 'post', 'put', 'delete'].indexOf(verb) === -1) { throw `Unknown verb for: ${route.url}`; }
                            theRoute[verb]((req, res) => { theHandler(route.url, verb, route.class, route.func, req, res); });
                        } else {
                            router.add(route.url, function() {
                                // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                theHandler(route.url, '', route.class, 'navigate', this, null);
                            });
                        }
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