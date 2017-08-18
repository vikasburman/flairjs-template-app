define([
    use('[Base]'),
    use('[IBootware]'),
    use('[App]'),
    use('sys.core.app.IApp'),
    use('express'),
    use('fs')
], (Base, IBootware, ServerApp, IApp, express, fs) => {
    /**
     * @class sys.core.boot.Server
     * @classdesc sys.core.boot.Server
     * @desc Starts server processing.
     */    
    return Class('sys.core.boot.Server', Base, [IBootware], function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base) => {
            base();

            // create express app
            this.app = express();

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
        this.prop('app', null);

        attr('private'); 
        this.prop('server', null);

        attr('private');
        this.prop('bootwares', []);

        attr('async');
        this.func('boot', (resolve, reject) => {
            // modify req and res
            this.app.use((req, res, next) => {
                // set access control headers in response
                let responseHeaders = this.settings('response.headers', []);
                for(let header of responseHeaders) {
                    res.header(header.name, header.value);
                }

                // go next
                next();
            });

            // express app settings
            let appSettings = this.settings('express', {});
            for(let appSetting in appSettings) {
                if (appSettings.hasOwnProperty(appSetting)) {
                    this.app.set(appSetting, appSettings[appSetting]);
                }
            }

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
                            bootware.boot(this.app).then(() => {
                                xLog(`Bootware (booted): ${bootware._.name}`);
                                _resolve();
                            }).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(() => {
                    // boot server itself
                    if (!this.env.isProd) {
                        let http = require('http');
                        let port = this.settings('port.dev', 80);
                        this.app.set('port', port);
                        this.server = http.createServer(this.app);
                    } else { 
                        // SSL Certificate
                        // NOTE: For creating test certificate:
                        //  > Goto http://www.cert-depot.com/
                        //  > Create another test certificate
                        //  > Download KEY+PEM files
                        //  > Rename *.private.pem as key.pem
                        //  > Rename *.public.pem as cert.pem
                        //  > Update these files at root
                        let privateKey  = fs.readFileSync(this.settings('ssl.private'), 'utf8');
                        let certificate = fs.readFileSync(this.settings('ssl.public'), 'utf8');
                        let credentials = { key: privateKey, cert: certificate };

                        let https = require('https');
                        let port = this.settings('port.prod', 443);
                        this.app.set('port', port);
                        this.server = https.createServer(credentials, this.app);
                    }

                    // done
                    resolve();                        
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', (resolve, reject) => {
            // setup event handlers
            this.server.on('error', this.onError);
            this.server.on('listening', () => {
                // instantiate app in global variable
                App = as(new ServerApp(this.app), IApp);
                if (!App) { reject('Invalid app definition.'); return; }

                // ready configured bootwares
                include(this.bootwares, true).then((items) => {
                    forAsync(items, (_resolve, _reject, Bootware) => {
                        if (Bootware && typeof Bootware === 'function') {
                            let bootware = as(new Bootware(), IBootware);
                            if (bootware) {
                                bootware.ready(this.app).then(() => {
                                    xLog(`Bootware (ready): ${bootware._.name}`);
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
                        console.log(`ready: (server, ${this.env.get('type', 'unknown')})`);

                        // start
                        App.start().then(() => {
                            console.log(App.info.title + ' - ' + App.info.version);

                            if (!this.env.isTest) {
                                // perform default action: assume default is requested
                                let url = '/';
                                xLog(`navigation: ${url}`);
                                App.navigate(url);
                            }

                            // done
                            resolve();
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });

            // start listining
            this.server.listen(this.app.get('port'));
        });
    });
});