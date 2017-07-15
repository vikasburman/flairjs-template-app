define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class sys.core.bootwares.server.Middlewares
     * @classdesc sys.core.bootwares.server.Middlewares
     * @desc Configure server-side middlewares.
     */    
    return Class('sys.core.bootwares.server.Middlewares', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let middlewares = this.settings('middlewares', []);

            // load all middlewares
            // each definition is:
            // { "name": "", func:"", args": []}
            // name: name of the middleware module
            // func: name of the function of the module that return middleware (optional)
            // args: optional args, if to be passed to middleware
            for(let item of middlewares) {
                mw = require(use(item.name));
                if (mw) {
                    if (item.args) {
                        if (item.func) {
                            app.use(mw[item.func](...item.args));
                        } else {
                            app.use(mw(...item.args));
                        }
                    } else {
                        if (item.func) {
                            app.use(mw[item.func]());
                        } else {
                            app.use(mw());
                        }
                    }
                }
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});