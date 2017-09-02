define([
    use('[Base]'),
    use('[IBootware]'),
    use('[App]'),
    use('[IApp]'),
    use('express'),
    use('fs')
], (Base, IBootware, ServerApp, IApp, express, fs) => {
    /**
     * @class app.core.boot.Server
     * @classdesc app.core.boot.Server
     * @desc Starts server processing.
     */    
    return Class('app.core.boot.Server', Base, [IBootware], function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base) => {
            base();

            // create express app
            this.app = express();

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
        this.prop('app', null);

        attr('private'); 
        this.prop('server', {
            http: null,
            https: null
        });

        attr('private');
        this.prop('bootwares', []);

        attr('async');
        this.func('boot', (resolve, reject) => {
            // modify req and res
            this.app.use((req, res, next) => {
                // set access control headers in response
                let responseHeaders = this.settings('response.headers', []),
                    more = this.settings('more.response.headers', []);
                responseHeaders = responseHeaders.concat(more); 
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
                                xLog('debug', `Bootware (booted): ${bootware._.name}`);
                                _resolve();
                            }).catch(_reject);
                        } else {
                            xLog('debug', `Bootware (skipped): ${Bootware._.name} (not a bootware)`);
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(() => {
                    // boot server itself
                    if (this.settings('server.http.enable', false)) {
                        let http = require('http');
                        this.server.http = http.createServer(this.app);
                        this.server.http.on('error', this.onError);

                         // configure
                        let timeout = this.settings('server.http.timeout', -1);
                        if (timeout !== -1) { 
                            this.server.http.timeout = timeout; // timeout must be in milliseconds
                        }
                    }
                    if (this.settings('server.https.enable', false)) {
                        // SSL Certificate
                        // NOTE: For creating test certificate:
                        //  > Goto http://www.cert-depot.com/
                        //  > Create another test certificate
                        //  > Download KEY+PEM files
                        //  > Rename *.private.pem as key.pem
                        //  > Rename *.public.pem as cert.pem
                        //  > Update these files at root
                        let privateKey  = fs.readFileSync(this.settings('server.https.ssl.private'), 'utf8');
                        let certificate = fs.readFileSync(this.settings('server.https.ssl.public'), 'utf8');
                        let credentials = { key: privateKey, cert: certificate };

                        let https = require('https');
                        this.server.https = https.createServer(credentials, this.app);
                        this.server.https.on('error', this.onError);

                        // configure
                        let timeout = this.settings('server.https.timeout', -1);
                        if (timeout !== -1) { 
                            this.server.https.timeout = timeout; // timeout must be in milliseconds
                        }
                    }

                    // done
                    resolve();                        
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', (resolve, reject) => {
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
                    xLog('verbose', `ready: (server, ${this.env.get('type', 'unknown')}, ${this.env.getLocale().name})`);

                    // start
                    App.start().then(() => {
                        xLog('info', App.info.title + ' - ' + App.info.version);

                        // start listining
                        let httpPort = -1,
                            httpsPort = -1;

                        const listining = (type, port) => { xLog('verbose', `${type}: listining on ${port}`); };
                        if (this.server.http && this.server.https) {
                            httpsPort = process.env.PORT || this.settings('server.https.port', 443);
                            httpPort = this.settings('server.http.port', 80);
                            this.server.http.listen(httpPort, () => {
                                listining('http', httpPort);
                                this.server.https.listen(httpsPort, () => {
                                    listining('https', httpsPort);
                                });
                            });
                        } else if (this.server.http) {
                            httpPort = process.env.PORT || this.settings('server.http.port', 80);
                            this.server.http.listen(httpPort, () => {
                                listining('http', httpPort);
                            });
                        } else if (this.server.https) {
                            httpsPort = process.env.PORT || this.settings('server.https.port', 443);
                            this.server.https.listen(httpsPort, () => {
                                listining('https', httpsPort);
                            });
                        } else {
                            xLog('verbose', 'server not started');
                        }

                        // done
                        resolve();
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    });
});