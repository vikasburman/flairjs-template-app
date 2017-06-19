define([
    use('[Base]'),
    use('serve-favicon'),
    use('express')
], (Base, favicon, express) => {
    /**
     * @class sys.bootwares.server.Static
     * @classdesc sys.bootwares.server.Static
     * @desc Static content serving configuration.
     */    
    return Class('Sttaic', Base, function(attr) {
        this.assembly = 'sys.bootwares';

        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // configure favicon
            app.use(favicon(use('www/' + this.settings('static.favIcon', ''))));

            // configure static content serving
            let age = this.settings('static.caching.age', 0) ;
            if (this.settings('static.caching.enabled') && age !== 0) { 
                app.use('/', express.static(use('www/'), { maxAge: age }));
                app.use('/web', express.static(use('web/'), { maxAge: age }));
                app.use('/sys', express.static(use('sys/'), { maxAge: age }));
            } else {
                app.use('/', express.static(use('www/')));
                app.use('/web', express.static(use('web/')));
                app.use('/sys', express.static(use('sys/')));
            }

            // dome
            resolve();
        });
    });
});