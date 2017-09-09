define([
    use('[Base]'),
    use('[IBootware]'),
    use('serve-favicon'),
    use('express')
], (Base, IBootware, favicon, express) => {
    /**
     * @class app.core.bootwares.StaticServer
     * @classdesc app.core.bootwares.StaticServer
     * @desc Static content serving configuration.
     */    
    return Class('app.core.bootwares.StaticServer', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // configure favicon
            let fi = this.settings('static.favIcon', '');
            if (fi) {
                fi = use(fi);
                app.use(favicon(fi));
                xLog('debug', `favIcon: ${fi}`);
            } else {
                xLog('debug', `favIcon: (none)`);
            }

            // configure static content serving
            let age = this.settings('static.caching.age', 0),
                staticFolders = this.settings(':static', []),
                specialStaticFolders = [],
                isEnableCaching = (this.settings('static.caching.enable', false) && age !== 0);
            for(let staticFolder of staticFolders) {
                staticFolder = use(staticFolder).replace('members/', '').replace('.js', '') + 'static/';
                if (isEnableCaching) {
                    app.use('/', express.static(staticFolder, { maxAge: age }));
                } else {
                    app.use('/', express.static(staticFolder));
                }
                xLog('debug', `static: / = ${staticFolder}`);
            }
            specialStaticFolders = [
                { root: '/sys', path: './sys/modules/' },
                { root: '/web', path: './web/modules/' },
                { root: '/web', path: './sys/modules_web/' }
            ];
            for(let specialStaticFolder of specialStaticFolders) {
                if (isEnableCaching) {
                    app.use(specialStaticFolder.root, express.static(specialStaticFolder.path, { maxAge: age }));
                } else {
                    app.use(specialStaticFolder.root, express.static(specialStaticFolder.path));
                }
                xLog('debug', `static: ${specialStaticFolder.root} = ${specialStaticFolder.path}`);
            }

            // done
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);        
    });
});