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
                xLog(`favIcon: ${fi}`);
            }

            // configure static content serving
            let age = this.settings('static.caching.age', 0),
                mainModule = this.settings(':main', 'sample'),
                spath = '',
                staticFolders = this.settings(':static', []);
                staticFolders.unshift(mainModule); // add main module by default, on top both in server and client side
                staticFolders.unshift(this.assembly); // add sys.core (this module) on top as first default item
            if (this.settings('static.caching.enabled') && age !== 0) { 
                for(let staticFolder of staticFolders) {
                    if (!staticFolder.startsWith('sys.')) {
                        staticFolder = 'web.' + staticFolder;
                    }
                    staticFolder = use(staticFolder).replace('members/', '').replace('.js', '') + '/static/';
                    app.use('/', express.static(staticFolder, { maxAge: age }));
                    xLog(`static: / = ${staticFolder}`);
                }
                spath = use('./web/modules/');
                app.use('/web', express.static(spath, { maxAge: age }));
                xLog(`static: /web = ${spath}`);
                spath = use('./sys/modules/');
                app.use('/sys', express.static(spath, { maxAge: age }));
                xLog(`static: /sys = ${spath}`);
            } else {
                for(let staticFolder of staticFolders) {
                    if (!staticFolder.startsWith('sys.')) {
                        staticFolder = 'web.' + staticFolder;
                    }
                    staticFolder = use(staticFolder).replace('members/', '').replace('.js', '') + '/static/';
                    app.use('/', express.static(staticFolder));
                    xLog(`static: / = ${staticFolder}`);
                }
                spath = use('./web/modules/');
                app.use('/web', express.static(spath));
                xLog(`static: /web = ${spath}`);
                spath = use('./sys/modules/');
                app.use('/sys', express.static(spath));
                xLog(`static: /sys = ${spath}`);
            }

            // done
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);        
    });
});