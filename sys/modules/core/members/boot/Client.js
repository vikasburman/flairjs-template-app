define([
    use('[Base]'),
    use('[IBootware]'),
    use('[App]'),
    use('sys.core.app.IApp')
], (Base, IBootware, ClientApp, IApp) => {
    /**
     * @class sys.core.boot.Client
     * @classdesc sys.core.boot.Client
     * @desc Starts client processing.
     */    
    return Class('sys.core.boot.Client', Base, [IBootware], function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base) => {
            base();

            // resolve path of bootwares
            let bootwares = this.settings('bootwares', []).slice(),
                more = this.settings('more.bootwares', []).slice();
            this.bootwares = bootwares.concat(more);
            if (this.bootwares.length > 0) {
                let i = 0;
                for(let item of this.bootwares) {
                    this.bootwares[i] = use(item); i++;
                }
            }
        });

        attr('private');
        this.prop('bootwares', []);

        attr('async');
        this.func('boot', (resolve, reject) => {
            // env setting
            if (this.env.isProd) {
                this.env.set('type', 'prod');
            } else {
                if (this.env.isDev) {
                    this.env.set('type', 'dev');
                } else {
                    this.env.set('type', 'dbg');
                }
            }

            // boot configured bootwares
            include(this.bootwares, true).then((items) => {
                forAsync(items, (_resolve, _reject, Bootware) => {
                    if (Bootware && typeof Bootware === 'function') {
                        let bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.boot().then(() => {
                                xLog('debug', `Bootware (booted): ${bootware._.name}`);
                                _resolve();
                            }).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(() => {
                    // nothins as such to boot on client

                    // done
                    resolve();                        
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', (resolve, reject) => {
            // instantiate app in global variable
            App = as(new ClientApp(), IApp);
            if (!App) { reject('Invalid app definition.'); return; }

            // ready configured bootwares
            include(this.bootwares, true).then((items) => {
                forAsync(items, (_resolve, _reject, Bootware) => {
                    if (Bootware && typeof Bootware === 'function') {
                        let bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.ready().then(() => {
                                xLog('debug', `Bootware (ready): ${bootware._.name}`);
                                _resolve();
                            }).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(() => {
                    // finally ready
                    this.env.isReady = true;
                    xLog('verbose', `ready: (client, ${this.env.get('type', 'unknown')}, ${this.env.getLocale().name})`);

                    // start
                    App.start().then(() => {
                        xLog('info', App.info.title + ' - ' + App.info.version);

                        if (!this.env.isTest) {
                            // perform default action: open home view or currently opened view
                            let url = document.location.hash.replace('#', '') || '/';
                            App.navigate(url);
                        }

                        // done
                        resolve();
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    });
});