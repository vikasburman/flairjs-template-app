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
            let fi = this.settings('static.favIcon', '');
            if (fi) {
                app.use(favicon(use(fi)));
            }

            // configure static content serving
            let age = this.settings('static.caching.age', 0),
                wwwFolders = this.settings(':www', []);
                wwwFolders.unshift(this.assembly); // add sys.core on top as first default item
            if (this.settings('static.caching.enabled') && age !== 0) { 
                for(let wwwFolder of wwwFolders) {
                    wwwFolder = use(wwwFolder).replace('members/', '').replace('.js', '') + 'www/';
                    app.use('/', express.static(wwwFolder, { maxAge: age }));
                    if (this.env.isDev) { console.log('static: / = ' + wwwFolder); }
                }
                app.use('/web', express.static(use('./web/modules/'), { maxAge: age }));
                if (this.env.isDev) { console.log('static: /web = ' + use('./web/modules/')); }
                app.use('/sys', express.static(use('./sys/modules/'), { maxAge: age }));
                if (this.env.isDev) { console.log('static: /sys = ' + use('./sys/modules/')); }
            } else {
                for(let wwwFolder of wwwFolders) {
                    wwwFolder = use(wwwFolder).replace('members/', '').replace('.js', '') + 'www/';
                    app.use('/', express.static(wwwFolder));
                    if (this.env.isDev) { console.log('static: / = ' + wwwFolder); }
                }
                app.use('/web', express.static(use('./web/modules/')));
                if (this.env.isDev) { console.log('static: /web = ' + use('./web/modules/')); }
                app.use('/sys', express.static(use('./sys/modules/')));
                if (this.env.isDev) { console.log('static: /sys = ' + use('./sys/modules/')); }
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);        
    });
});