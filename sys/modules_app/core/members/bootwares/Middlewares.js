define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class app.core.bootwares.Middlewares
     * @classdesc app.core.bootwares.Middlewares
     * @desc Configure server-side middlewares.
     */    
    return Class('app.core.bootwares.Middlewares', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let middlewares = this.settings('middlewares', []),
                more = this.settings('more.middlewares', []);
            middlewares = middlewares.concat(more); 

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
                            xLog('debug', `middleware: ${item.name}.${item.func}(${item.args})`);
                        } else {
                            app.use(mw(...item.args));
                            xLog('debug', `middleware: ${item.name}(${item.args})`);
                        }
                    } else {
                        if (item.func) {
                            app.use(mw[item.func]());
                            xLog('debug', `middleware: ${item.name}.${item.func}()`);
                        } else {
                            app.use(mw());
                            xLog('debug', `middleware: ${item.name}()`);
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