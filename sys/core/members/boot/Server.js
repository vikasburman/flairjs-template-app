define([
    use('[Base]'),
    use('[Main]'),
    use('express'),
    use('fs')
], (Base, Main, express, fs) => {
    /**
     * @class sys.core.boot.Server
     * @classdesc sys.core.boot.Server
     * @desc Starts server processing.
     */    
    return Class('Server', Base, function(attr) {
        attr('sealed');
        this.func('constructor', () => {
            // create express app
            this.app = express();

            // define assembly
            this.assembly = 'sys.core';

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
                // set current subdomain in request for later use
                let sd = req.headers.host.toLowerCase(); // e.g., abc.xyz.com or abc.xyz.site.com
                if (sd === 'localhost' || sd === '127.0.0.1') {
                    sd = 'www';
                } else {
                    sd = sd.substr(0, sd.lastIndexOf('.')); // become abc.xyz or abc.xyz.site
                    sd = sd.substr(0, sd.lastIndexOf('.')); // become abc or abc.xyz
                }
                req.subdomain = sd;

                // set access control headers in response
                let responseHeaders = this.settings('subdomains.' + req.subdomain + '.response.headers', []);
                for(let header of responseHeaders) {
                    res.header(header.name, header.value);
                }

                // go next
                next();
            });

            // boot configured bootwares
            include(this.bootwares, true).then((items) => {
                forAsync(items, (_resolve, _reject, Bootware) => {
                    let bootware = new Bootware();
                    if (typeof bootware.boot === 'function') {
                        bootware.boot(this.app).then(_resolve).catch(_reject);
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

        attr('async')
        this.func('ready', (resolve, reject) => {
            // setup event handlers
            this.server.on('error', this.onError);
            this.server.on('listening', () => {
                // ready configured bootwares
                include(this.bootwares, true).then((items) => {
                    forAsync(items, (_resolve, _reject, Bootware) => {
                        let bootware = new Bootware();
                        if (typeof bootware.ready === 'function') {
                            bootware.ready(this.app).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    }).then(() => {
                        // finally ready
                        this.env.isReady = true;
                        let serverOrClient = (this.env.isServer ? 'server' : 'client');
                        console.log(this.env.isProd ? `ready: (${serverOrClient}, production)` : `ready: (${serverOrClient}, dev)`);

                        // load main (if not test mode)
                        if (!this.env.isTest) {
                            let main = new Main(this.app);
                            main.start().then(resolve).catch(reject);
                        } else {
                            resolve();
                        }
                    }).catch(reject);
                }).catch(reject);
            });

            // start listining
            this.server.listen(this.app.get('port'));
        });
    });
});