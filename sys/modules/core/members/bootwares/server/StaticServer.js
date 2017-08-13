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
                publicFolders = this.settings(':static', []);
                publicFolders.unshift(this.assembly); // add sys.core on top as first default item
            if (this.settings('static.caching.enabled') && age !== 0) { 
                for(let publicFolder of publicFolders) {
                    publicFolder = use(publicFolder).replace('members/', '').replace('.js', '') + 'public/';
                    app.use('/', express.static(publicFolder, { maxAge: age }));
                    if (this.env.isDev) { console.log('static: / = ' + publicFolder); }
                }
                app.use('/web', express.static(use('./web/modules/'), { maxAge: age }));
                if (this.env.isDev) { console.log('static: /web = ' + use('./web/modules/')); }
                app.use('/sys', express.static(use('./sys/modules/'), { maxAge: age }));
                if (this.env.isDev) { console.log('static: /sys = ' + use('./sys/modules/')); }
            } else {
                for(let publicFolder of publicFolders) {
                    publicFolder = use(publicFolder).replace('members/', '').replace('.js', '') + 'public/';
                    app.use('/', express.static(publicFolder));
                    if (this.env.isDev) { console.log('static: / = ' + publicFolder); }
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