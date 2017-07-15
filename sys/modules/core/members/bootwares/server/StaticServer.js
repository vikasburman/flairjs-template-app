define([
    use('[Base]'),
    use('[IBootware]'),
    use('serve-favicon'),
    use('express')
], (Base, IBootware, favicon, express) => {
    /**
     * @class sys.core.bootwares.server.StaticServer
     * @classdesc sys.core.bootwares.server.StaticServer
     * @desc Static content serving configuration.
     */    
    return Class('sys.core.bootwares.server.StaticServer', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // configure favicon
            app.use(favicon(use('./web/www/' + this.settings('static.favIcon', ''))));

            // configure static content serving
            let age = this.settings('static.caching.age', 0) ;
            if (this.settings('static.caching.enabled') && age !== 0) { 
                app.use('/', express.static(use('./web/www/'), { maxAge: age }));
                app.use('/', express.static(use('./sys/www/'), { maxAge: age }));
                app.use('/web', express.static(use('./web/modules/'), { maxAge: age }));
                app.use('/sys', express.static(use('./sys/modules/'), { maxAge: age }));
            } else {
                app.use('/', express.static(use('./web/www/')));
                app.use('/', express.static(use('./sys/www/')));
                app.use('/web', express.static(use('./web/modules/')));
                app.use('/sys', express.static(use('./sys/modules/')));
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);        
    });
});