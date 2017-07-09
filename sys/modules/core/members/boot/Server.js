define([
    use('[Base]'),
    use('[IBootware]'),
    use('sys.core.IApp'),
    use('[App]'),
    use('express'),
    use('fs')
], (Base, IBootware, IApp, ServerApp, express, fs) => {
    /**
     * @class sys.core.boot.Server
     * @classdesc sys.core.boot.Server
     * @desc Starts server processing.
     */    
    return Class('sys.core.boot.Server', Base, [IBootware], function(attr) {
        attr('sealed');
        this.func('constructor', () => {
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

            // production setting
            if (this.env.isProd) {
                this.app.set('env', 'production');
            } else {
                this.app.set('env', 'development');
            }

            // boot configured bootwares
            include(this.bootwares, true).then((items) => {
                forAsync(items, (_resolve, _reject, Bootware) => {
                    if (Bootware) {
                        let bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.boot(this.app).then(_resolve).catch(_reject);
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
                        let port = this.settings('port.dev', 443);
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
                // ready configured bootwares
                include(this.bootwares, true).then((items) => {
                    forAsync(items, (_resolve, _reject, Bootware) => {
                        if (Bootware) {
                            let bootware = as(new Bootware(), IBootware);
                            if (bootware) {
                                bootware.ready(this.app).then(_resolve).catch(_reject);
                            } else {
                                _resolve();
                            }
                        } else {
                            _resolve();
                        }
                    }).then(() => {
                        // finally ready
                        this.env.isReady = true;
                        console.log(this.env.isProd ? `ready: (server, production)` : `ready: (server, dev)`);

                        // load server app
                        let serverApp = as(new ServerApp(this.app), IApp);
                        if (serverApp) {
                            // set
                            App = serverApp;

                            // start (if not test mode)
                            if (!this.env.isTest) {
                                serverApp.start().then(() => {
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

            // start listining
            this.server.listen(this.app.get('port'));
        });
    });
});