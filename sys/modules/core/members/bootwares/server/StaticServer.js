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
            let mainModule = this.settings(':main', 'sample'),
                fi = this.settings('static.favIcon', '');
            if (fi) {
                fi = 'web/' + mainModule + '/static/' + fi;
                app.use(favicon(use(fi)));
                if (this.env.isDev) { console.log('favIcon: ' + fi); }
            }

            // configure static content serving
            let age = this.settings('static.caching.age', 0),
                staticFolders = this.settings(':static', []);
                staticFolders.unshift('web.' + mainModule); // add main module by default, on top both in server and client side
                staticFolders.unshift(this.assembly); // add sys.core (this module) on top as first default item
            if (this.settings('static.caching.enabled') && age !== 0) { 
                for(let staticFolder of staticFolders) {
                    staticFolder = use(staticFolder).replace('members/', '').replace('.js', '') + 'static/';
                    app.use('/', express.static(staticFolder, { maxAge: age }));
                    if (this.env.isDev) { console.log('static: / = ' + staticFolder); }
                }
                app.use('/web', express.static(use('./web/modules/'), { maxAge: age }));
                if (this.env.isDev) { console.log('static: /web = ' + use('./web/modules/')); }
                app.use('/sys', express.static(use('./sys/modules/'), { maxAge: age }));
                if (this.env.isDev) { console.log('static: /sys = ' + use('./sys/modules/')); }
            } else {
                for(let staticFolder of staticFolders) {
                    staticFolder = use(staticFolder).replace('members/', '').replace('.js', '') + 'static/';
                    app.use('/', express.static(staticFolder));
                    if (this.env.isDev) { console.log('static: / = ' + staticFolder); }
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