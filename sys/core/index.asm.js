'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/core/members/Base.js)
define('sys.core.Base', function () {
    /**
     * @class sys.core.Base
     * @classdesc sys.core.Base
     * @desc Base class for all classes.
     */
    return Class('Base', function (attr) {
        var _this = this;

        attr('protected');
        this.prop('env', config.env);

        attr('protected');
        this.prop('assembly', '');

        attr('protected');
        this.func('settings', function (key) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (key.indexOf(':') !== -1) {
                return settings(key, defaultValue);
            } else if (_this.assembly === '') {
                throw 'assembly namespace must be defined.';
            } else {
                return settings(_this.assembly + ':' + key, defaultValue);
            }
        });

        attr('protected');
        this.func('onError', function (err) {
            console.log('Error in ' + (_this.assembly + '.' + _this._.name) + ' (' + err.toString() + ')');
            if (!config.env.isProd) {
                console.log('' + err);
            }
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/core/members/Base.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/core/members/boot/Client.js)
define('sys.core.boot.Client', [use('[Base]')], function (Base) {
    return Class('Client', Base, function (attr) {
        attr('async');
        this.func('boot', function (resolve, reject) {
            resolve();
        });

        attr('async');
        this.func('ready', function (resolve, reject) {
            resolve();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/core/members/boot/Client.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/core/members/boot/Server.js)
define('sys.core.boot.Server', [use('[Base]'), use('[Main]'), use('express'), use('fs')], function (Base, Main, express, fs) {
    /**
     * @class sys.core.boot.Server
     * @classdesc sys.core.boot.Server
     * @desc Starts server processing.
     */
    return Class('Server', Base, function (attr) {
        var _this = this;

        attr('sealed');
        this.func('constructor', function () {
            // create express app
            _this.app = express();

            // define assembly
            _this.assembly = 'sys.core';

            // resolve path of bootwares
            _this.bootwares = _this.settings('bootwares', []).slice();
            if (_this.bootwares.length > 0) {
                var i = 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _this.bootwares[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;

                        _this.bootwares[i] = use(item);i++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
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
        this.func('boot', function (resolve, reject) {
            // modify req and res
            _this.app.use(function (req, res, next) {
                // set current subdomain in request for later use
                var sd = req.headers.host.toLowerCase(); // e.g., abc.xyz.com or abc.xyz.site.com
                if (sd === 'localhost' || sd === '127.0.0.1') {
                    sd = 'www';
                } else {
                    sd = sd.substr(0, sd.lastIndexOf('.')); // become abc.xyz or abc.xyz.site
                    sd = sd.substr(0, sd.lastIndexOf('.')); // become abc or abc.xyz
                }
                req.subdomain = sd;

                // set access control headers in response
                var responseHeaders = _this.settings('subdomains.' + req.subdomain + '.response.headers', []);
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = responseHeaders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var header = _step2.value;

                        res.header(header.name, header.value);
                    }

                    // go next
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                next();
            });

            // boot configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    var bootware = new Bootware();
                    if (typeof bootware.boot === 'function') {
                        bootware.boot(_this.app).then(_resolve).catch(_reject);
                    } else {
                        _resolve();
                    }
                }).then(function () {
                    // boot server itself
                    if (!_this.env.isProd) {
                        var http = require('http');
                        var port = _this.settings('port.dev', 80);
                        _this.app.set('port', port);
                        _this.server = http.createServer(_this.app);
                    } else {
                        // SSL Certificate
                        // NOTE: For creating test certificate:
                        //  > Goto http://www.cert-depot.com/
                        //  > Create another test certificate
                        //  > Download KEY+PEM files
                        //  > Rename *.private.pem as key.pem
                        //  > Rename *.public.pem as cert.pem
                        //  > Update these files at root
                        var privateKey = fs.readFileSync(_this.settings('ssl.private'), 'utf8');
                        var certificate = fs.readFileSync(_this.settings('ssl.public'), 'utf8');
                        var credentials = { key: privateKey, cert: certificate };

                        var https = require('https');
                        var _port = _this.settings('port.dev', 443);
                        _this.app.set('port', _port);
                        _this.server = https.createServer(credentials, _this.app);
                    }

                    // done
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', function (resolve, reject) {
            // setup event handlers
            _this.server.on('error', _this.onError);
            _this.server.on('listening', function () {
                // ready configured bootwares
                include(_this.bootwares, true).then(function (items) {
                    forAsync(items, function (_resolve, _reject, Bootware) {
                        var bootware = new Bootware();
                        if (typeof bootware.ready === 'function') {
                            bootware.ready(_this.app).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    }).then(function () {
                        // finally ready
                        _this.env.isReady = true;
                        var serverOrClient = _this.env.isServer ? 'server' : 'client';
                        console.log(_this.env.isProd ? 'ready: (' + serverOrClient + ', production)' : 'ready: (' + serverOrClient + ', dev)');

                        // load main (if not test mode)
                        if (!_this.env.isTest) {
                            var main = new Main(_this.app);
                            main.start().then(resolve).catch(reject);
                        } else {
                            resolve();
                        }
                    }).catch(reject);
                }).catch(reject);
            });

            // start listining
            _this.server.listen(_this.app.get('port'));
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/core/members/boot/Server.js)