define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.bootwares.server.Middlewares
     * @classdesc sys.bootwares.server.Middlewares
     * @desc Configure server-side middlewares.
     */    
    return Class('Middlewares', Base, function(attr) {
        this.assembly = 'sys.bootwares';

        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let middlewares = this.settings('middlewares', []);

            // load all middlewares
            for(let item of middlewares) {
                mw = require(item.name); // always node modules, so not using (use)
                if (item.args) {
                    app.use(mw(...item.args));
                } else {
                    app.use(mw()); 
                }
            }

            // dome
            resolve();
        });
    });
});