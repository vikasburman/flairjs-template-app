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
            this.bootwares = this.settings('bootwares', []).slice();
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
            // boot configured bootwares
            include(this.bootwares, true).then((items) => {
                forAsync(items, (_resolve, _reject, Bootware) => {
                    if (Bootware) {
                        let bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.boot().then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(() => {
                    // boot client itself
                    // (nothing as of now)

                    // done
                    resolve();                        
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', (resolve, reject) => {
            // ready configured bootwares
            include(this.bootwares, true).then((items) => {
                forAsync(items, (_resolve, _reject, Bootware) => {
                    if (Bootware) {
                        let bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.ready().then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(() => {
                    // finally ready
                    this.env.isReady = true;
                    console.log(this.env.isProd ? `ready: (client, production)` : `ready: (client, dev)`);

                    // load client app
                    let clientApp = as(new ClientApp(), IApp);
                    if (clientApp) {
                        // set
                        App = clientApp;

                        // start (if not test mode)
                        if (!this.env.isTest) {
                            clientApp.start().then(() => {
                                console.log(App.title + ' - ' + App.version);
                                resolve();
                            }).catch(reject);
                        } else {
                            resolve();
                        }
                        } else {
                        reject('Invalid app definition.');
                    }
                }).catch(reject);
            }).catch(reject);
        });
    });
});