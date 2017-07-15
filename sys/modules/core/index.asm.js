'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/Base.js)
define('sys.core.Base', function () {
    /**
     * @class sys.core.Base
     * @classdesc sys.core.Base
     * @desc Base class for all classes.
     */
    return Class('sys.core.Base', function (attr) {
        var _this = this;

        this.func('constructor', this.noop);

        attr('protected');
        this.prop('env', config.env);

        var _assembly = '';
        attr('readonly');
        attr('protected');
        this.prop('assembly', function () {
            if (!_assembly) {
                var parts = _this._.name.split('.');
                if (parts.length > 1) {
                    _assembly = parts[0] + '.' + parts[1];
                }
            }
            return _assembly;
        });

        attr('protected');
        this.func('settings', function (key) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (key.indexOf(':') !== -1) {
                return settings(key, defaultValue);
            } else if (_this.assembly === '') {
                throw 'assembly must be defined.';
            } else {
                return settings(_this.assembly + ':' + key, defaultValue);
            }
        });

        attr('protected');
        this.func('onError', function (err) {
            console.log('Error in ' + _this._.name + ' (' + err.toString() + ')');
            if (!config.env.isProd) {
                console.log('' + err);
            }
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/Base.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ErrorInfo.js)
define('sys.core.ErrorInfo', function () {
    /**
     * @class sys.core.ErrorInfo
     * @classdesc sys.core.ErrorInfo
     * @desc Error information.
     */
    return Class('sys.core.ErrorInfo', function (attr) {
        var _this = this;

        attr('sealed');
        this.func('constructor', function (code, desc, details, raw) {
            if (typeof code === 'string') {
                _this.desc = code;
            } else {
                _this.raw = code;
                if (_this.raw.status !== undefined && _this.raw.statusText !== undefined) {
                    _this.code = raw.status;
                    _this.desc = raw.statusText;
                }
            }
            if (details) {
                _this.details = details;
            }
            if (!_this.env.isProd && _this.raw) {
                _this.stack = _this.raw.stack || _this.raw.responseText;
            }
        });

        this.prop('isServerError', this.env.isServer);
        this.prop('code', this.env.isServer ? 'server_error' : 'client_error');
        this.prop('desc', '');
        this.prop('details', '');
        this.prop('raw', null);
        this.prop('stack', '');
        this.func('toString', function () {
            return _this.code + ':' + _this.desc;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ErrorInfo.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/App.js)
define('sys.core.app.App', [use('[Base]'), use('sys.core.app.IApp')], function (Base, IApp) {
    /**
     * @class sys.core.app.App
     * @classdesc sys.core.app.App
     * @desc App base class.
     */
    return Class('sys.core.app.App', Base, [IApp], function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base) {
            base();

            _this.appSettings = _this.settings(':appSettings');
            _this.title = _this.appSettings.title;
            _this.version = _this.appSettings.version;
        });

        attr('readonly');
        this.prop('appSettings', null);

        attr('async');
        this.func('start', this.noopAsync);

        attr('async');
        this.func('auth', this.noopAsync);

        attr('readonly');
        this.prop('title', '');

        attr('readonly');
        this.prop('version', '');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/App.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/Client.js)
define('sys.core.app.Client', [use('sys.core.app.App')], function (App) {
    /**
     * @class sys.core.app.Client
     * @classdesc sys.core.app.Client
     * @desc Starts client application.
     */
    return Class('sys.core.app.Client', App, function (attr) {});
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/Client.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/IApp.js)
define('sys.core.app.IApp', function () {
  /**
   * @interface sys.core.app.IApp
   * @classdesc sys.core.app.IApp
   * @desc App interface.
   */
  return Interface('sys.core.app.IApp', function () {
    /**
     * @return {object} - promise object
     * @desc Runs anything that is required to execute now, when app is loaded and ready.
     */
    this.func('start');

    /**
     * @param {Request} request - current request object
     * @return {object} - promise object
     * @desc Authenticates and authorizes the current request as per given access information.
     */
    this.func('auth');

    this.prop('title');
    this.prop('version');
  });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/IApp.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/Server.js)
define('sys.core.app.Server', [use('sys.core.app.App')], function (App) {
    /**
     * @class sys.core.app.Server
     * @classdesc sys.core.app.Server
     * @desc Starts server application.
     */
    return Class('sys.core.app.Server', App, function (attr) {});
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/Server.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/Client.js)
define('sys.core.boot.Client', [use('[Base]'), use('[IBootware]'), use('[App]'), use('sys.core.app.IApp')], function (Base, IBootware, ClientApp, IApp) {
    /**
     * @class sys.core.boot.Client
     * @classdesc sys.core.boot.Client
     * @desc Starts client processing.
     */
    return Class('sys.core.boot.Client', Base, [IBootware], function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base) {
            base();

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
        this.prop('bootwares', []);

        attr('async');
        this.func('boot', function (resolve, reject) {
            // boot configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    if (Bootware) {
                        var bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.boot().then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(function () {
                    // boot client itself
                    // (nothing as of now)

                    // done
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', function (resolve, reject) {
            // ready configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    if (Bootware) {
                        var bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.ready().then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(function () {
                    // finally ready
                    _this.env.isReady = true;
                    console.log(_this.env.isProd ? 'ready: (client, production)' : 'ready: (client, dev)');

                    // load client app
                    var clientApp = as(new ClientApp(), IApp);
                    if (clientApp) {
                        // set
                        App = clientApp;

                        // start (if not test mode)
                        if (!_this.env.isTest) {
                            clientApp.start().then(function () {
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
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/Client.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/IBootware.js)
define('sys.core.boot.IBootware', function () {
    /**
     * @interface sys.core.boot.IBootware
     * @classdesc sys.core.boot.IBootware
     * @desc Bootware interface.
     */
    return Interface('sys.core.boot.IBootware', function () {
        this.func('boot');
        this.func('ready');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/IBootware.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/Server.js)
define('sys.core.boot.Server', [use('[Base]'), use('[IBootware]'), use('[App]'), use('sys.core.app.IApp'), use('express'), use('fs')], function (Base, IBootware, ServerApp, IApp, express, fs) {
    /**
     * @class sys.core.boot.Server
     * @classdesc sys.core.boot.Server
     * @desc Starts server processing.
     */
    return Class('sys.core.boot.Server', Base, [IBootware], function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base) {
            base();

            // create express app
            _this.app = express();

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
                // set access control headers in response
                var responseHeaders = _this.settings('response.headers', []);
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

            // express app settings
            var appSettings = _this.settings('express', {});
            for (var appSetting in appSettings) {
                if (appSettings.hasOwnProperty(appSetting)) {
                    _this.app.set(appSetting, appSettings[appSetting]);
                }
            }

            // production setting
            if (_this.env.isProd) {
                _this.app.set('env', 'production');
            } else {
                _this.app.set('env', 'development');
            }

            // boot configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    if (Bootware) {
                        var bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.boot(_this.app).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
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
                        if (Bootware) {
                            var bootware = as(new Bootware(), IBootware);
                            if (bootware) {
                                bootware.ready(_this.app).then(_resolve).catch(_reject);
                            } else {
                                _resolve();
                            }
                        } else {
                            _resolve();
                        }
                    }).then(function () {
                        // finally ready
                        _this.env.isReady = true;
                        console.log(_this.env.isProd ? 'ready: (server, production)' : 'ready: (server, dev)');

                        // load server app
                        var serverApp = as(new ServerApp(_this.app), IApp);
                        if (serverApp) {
                            // set
                            App = serverApp;

                            // start (if not test mode)
                            if (!_this.env.isTest) {
                                serverApp.start().then(function () {
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
            _this.server.listen(_this.app.get('port'));
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/Server.js)
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Attributes.js)
define('sys.core.bootwares.Attributes', [use('[Base]'), use('[IBootware]'), use('sys.core.comm.ServerRequest | sys.core.comm.ClientRequest'), use('sys.core.comm.ServerResponse | sys.core.comm.ClientResponse')], function (Base, IBootware, Request, Response) {
    /**
     * @class sys.core.bootwares.Attributes
     * @classdesc sys.core.bootwares.Attributes
     * @desc Define global framework attributes.
     */
    return Class('sys.core.bootwares.Attributes', Base, [IBootware], function (attr) {
        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // fetch
            // fetch(url, [options])
            //  url: can be relative, full or url pattern with /:<key> as part of url
            //  options: can be a literal having:
            //      - enableCookies: true (for same origin), false (no cookies sent), all (even for cross-origin calls)
            //      - responseDataType: text, json, blob, buffer, formData, objectUrl
            //      - auth: a function reference, that gives access headers for fetch operation (key-value pairs returned from here are added under headers)
            //      - Additionally it can have everything else that 'init' option of fetch request looks for (https://developer.mozilla.org/en/docs/Web/API/Fetch_API)
            Container.register(Class('fetch', Attribute, function () {
                var _this = this;

                this.decorator(function (obj, type, name, descriptor) {
                    // validate
                    if (['func'].indexOf(type) === -1) {
                        throw 'fetch attribute cannot be applied on ' + type + ' members. (' + name + ')';
                    }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) {
                        throw 'fetch attribute cannot be applied on special function. (' + name + ')';
                    }

                    // decorate
                    var fetchUrl = _this.args[0] || '',
                        staticOpts = _this.args[1] || {},
                        fn = descriptor.value,
                        fnArgs = null,
                        enableCookies = staticOpts.enableCookies || false,
                        responseDataType = staticOpts.responseDataType || null,
                        authFn = staticOpts.auth || null;
                    if (staticOpts.responseDataType) {
                        delete staticOpts.responseDataType;
                    }
                    if (staticOpts.auth) {
                        delete staticOpts.auth;
                    }
                    if (staticOpts.enableCookies) {
                        delete staticOpts.enableCookies;
                    }
                    descriptor.value = function (urlFillsOrInputData, inputData) {
                        // build url
                        var _fetchUrl = fetchUrl;
                        if (_fetchUrl.indexOf('/:') === -1) {
                            // e.g., items/:id or http://www.abc.com/items/:type/:id or /home#/pages/:page
                            inputData = urlFillsOrInputData; // that means, only inputData is passed as first argument and not urlFills
                        } else {
                            for (var fill in urlFillsOrInputData) {
                                if (urlFillsOrInputData.hasOwnProperty(fill)) {
                                    _fetchUrl = _fetchUrl.replace('/:' + fill, encodeURIComponent('/' + urlFillsOrInputData[fill].toString()));
                                }
                            }
                        }

                        // fetch
                        return new Promise(function (resolve, reject) {
                            var onFetch = function onFetch(err, response, data) {
                                fnArgs = [resolve, reject, new Response(response, err, data)];
                                fn.apply(undefined, _toConsumableArray(fnArgs));
                            };
                            if (_fetchUrl) {
                                // staticOpts: can be all that fetch's init argument expects
                                //             additionally it can have
                                if (inputData) {
                                    if (staticOpts.headers && staticOpts.headers['Content-Type'] && staticOpts.headers['Content-Type'].indexOf('json') !== -1) {
                                        staticOpts.body = JSON.stringify(inputData); // json
                                    } else {
                                        staticOpts.body = inputData; // could be text, buffer, array, object or formData
                                    }
                                }

                                // actual fetch
                                var doFetch = function doFetch() {
                                    fetch(_fetchUrl, staticOpts).then(function (response) {
                                        if (response.ok) {
                                            switch (responseDataType) {
                                                case 'json':
                                                    response.json().then(function (data) {
                                                        onFetch(null, response, data);
                                                    }).catch(function (err) {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'blob':
                                                    response.blob().then(function (data) {
                                                        onFetch(null, response, data);
                                                    }).catch(function (err) {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'buffer':
                                                    response.arrayBuffer().then(function (data) {
                                                        onFetch(null, response, data);
                                                    }).catch(function (err) {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'formData':
                                                    response.formData().then(function (data) {
                                                        onFetch(null, response, data);
                                                    }).catch(function (err) {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'objectUrl':
                                                    response.blob().then(function (data) {
                                                        onFetch(null, response, URL.createObjectURL(data));
                                                    }).catch(function (err) {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'text':
                                                default:
                                                    response.text().then(function (data) {
                                                        onFetch(null, response, data);
                                                    }).catch(function (err) {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                            }
                                        } else {
                                            onFetch(response.status, response, null);
                                        }
                                    }).catch(function (err) {
                                        onFetch(err, null, null);
                                    });
                                };

                                // cookies
                                if (enableCookies) {
                                    staticOpts.headers = staticOpts.headers || {};
                                    if (enableCookies === 'all') {
                                        staticOpts.headers.credentials = 'include';
                                    } else {
                                        staticOpts.headers.credentials = 'same-origin';
                                    }
                                } else {
                                    staticOpts.headers = staticOpts.headers || {};
                                    staticOpts.headers.credentials = 'omit';
                                }

                                // auth headers
                                if (typeof authFn === 'function') {
                                    authFn(name).then(function (authHeaders) {
                                        for (var authHeader in authHeaders) {
                                            if (authHeaders.hasOwnProperty(authHeader)) {
                                                staticOpts.headers = staticOpts.headers || {};
                                                staticOpts.headers[authHeader] = authHeaders[authHeader];
                                            }
                                        }
                                        doFetch();
                                    }).catch(function (err) {
                                        onFetch(err, null, null);
                                    });
                                } else {
                                    doFetch();
                                }
                            } else {
                                onFetch('invalid fetch url', null, null);
                            }
                        });
                    }.bind(obj);
                });
            }));

            // endpoint
            // endpoint([options])
            //  options: can be a literal having:
            //     - auth: true/false
            //     - access: access configuration information (could be any object that App on server and client understands)
            Container.register(Class('endpoint', Attribute, function () {
                var _this2 = this;

                this.decorator(function (obj, type, name, descriptor) {
                    // validate
                    if (['func'].indexOf(type) === -1) {
                        throw 'endpoint attribute cannot be applied on ' + type + ' members. (' + name + ')';
                    }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) {
                        throw 'endpoint attribute cannot be applied on special function. (' + name + ')';
                    }

                    // decorate
                    var fn = descriptor.value,
                        opts = _this2.args[0] || {},
                        auth = opts.auth || false,
                        access = opts.access || [],
                        fnArgs = null;
                    descriptor.value = function (req, res) {
                        // authenticate and serve request
                        return new Promise(function (resolve, reject) {
                            var request = new Request(req, new Response(res), access);
                            var onAuth = function onAuth() {
                                fnArgs = [resolve, reject, request];
                                fn.apply(undefined, _toConsumableArray(fnArgs));
                            };
                            if (auth) {
                                if (App) {
                                    App.auth(request).then(onAuth).catch(reject);
                                } else {
                                    reject('App is not available.');
                                }
                            } else {
                                onAuth();
                            }
                        });
                    }.bind(obj);
                });
            }));

            // cache
            // cache([duration])
            //  duration: in milliseconds, for how long to keep last result in cache (when not defined, it keeps it in cache forever till object is live)
            Container.register(Class('cache', Attribute, function () {
                var _this3 = this;

                this.decorator(function (obj, type, name, descriptor) {
                    // validate
                    if (['func'].indexOf(type) === -1) {
                        throw 'cache attribute cannot be applied on ' + type + ' members. (' + name + ')';
                    }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) {
                        throw 'cache attribute cannot be applied on special function. (' + name + ')';
                    }

                    // decorate
                    var fn = descriptor.value,
                        duration = _this3.args[0] || 0,
                        cachedValue = null,
                        isASync = false,
                        isCalledOnce = false,
                        lastCalled = null;
                    descriptor.value = function () {
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        var result = null,
                            callAndCache = function callAndCache() {
                            isCalledOnce = true;
                            result = fn.apply(undefined, args);
                            if (typeof result.then === 'function' && typeof result.catch === 'function') {
                                isASync = true;
                                return new Promise(function (resolve, reject) {
                                    result.then(function (data) {
                                        lastCalled = new Date().getMilliseconds();
                                        cachedValue = data;
                                        resolve(data);
                                    }).catch(function (err) {
                                        isCalledOnce = false;
                                        lastCalled = null;
                                        cachedValue = null;
                                        reject(err);
                                    });
                                });
                            } else {
                                lastCalled = new Date().getMilliseconds();
                                cachedValue = result;
                                return result;
                            }
                        };
                        if (!isCalledOnce) {
                            return callAndCache();
                        } else {
                            if (duration) {
                                var now = new Date().getMilliseconds();
                                if (now - lastCalled > duration) {
                                    return callAndCache();
                                }
                            }
                            if (isASync) {
                                return new Promise(function (resolve, reject) {
                                    resolve(cachedValue);
                                });
                            } else {
                                return cachedValue;
                            }
                        }
                    }.bind(obj);
                });
            }));

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Attributes.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/ErrorHandler.js)
define('sys.core.bootwares.ErrorHandler', [use('[Base]'), use('[IBootware]'), use('[ErrorInfo]')], function (Base, IBootware, ErrorInfo) {
    /**
     * @class sys.core.bootwares.ErrorHandler
     * @classdesc sys.core.bootwares.ErrorHandler
     * @desc Configure server and client global error handlers.
     */
    return Class('sys.core.bootwares.ErrorHandler', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            if (_this.env.isServer) {
                // catch 404 and forward to error handler
                app.use(function (req, res, next) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                });

                // error handlers
                if (_this.env.isProd) {
                    app.use(function (err, req, res, next) {
                        res.status(err.status || 500);
                        err.stack = ''; // exclude stacktrace
                        next(err);
                    });
                } else {
                    app.use(function (err, req, res, next) {
                        res.status(err.status || 500);
                        next(err);
                    });
                }
            } else {
                // setup global error handler
                window.onerror = function (desc, url, line, col, err) {
                    app.onError(new ErrorInfo('fatal_error', desc + ' at: ' + url + ', ' + line + ':' + col, '', err));
                };

                // global requirejs error handler
                require.onError = function (err) {
                    app.onError(new ErrorInfo(err));
                };
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/ErrorHandler.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Router.js)
define('sys.core.bootwares.Router', [use('[Base]'), use('[IBootware]'), use('express | sys/core/libs/pathparser{.min}.js')], function (Base, IBootware, RouteManager) {
    /**
     * @class sys.core.bootwares.Router
     * @classdesc sys.core.bootwares.Router
     * @desc Configure server/client side routes.
     */
    return Class('sys.core.bootwares.Router', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            var routesOrder = [],
                routes = [],
                router = _this.env.isServer ? RouteManager.Router() : new RouteManager({}),
                theRoute = null,
                routesKey = _this.env.isServer ? ':routesOrder.server' : ':routesOrder.client',
                theHandler = function theHandler(url, verb, cls, func, req, res) {
                include([use(cls)]).then(function (Handler) {
                    var handler = new Handler(),
                        handlerInfo = Reflector.get(handler),
                        funcInfo = handlerInfo.getMember(func);
                    if (!!funcInfo || funcInfo.getMemberType() !== 'func' || !funcInfo.hasAttribute('endpoint')) {
                        throw 'Invalid handler endpoint for: ' + url + '#' + verb;
                    }
                    handler[func](req, res);
                }).catch(function (err) {
                    throw err;
                });
            };

            // each route definition (both on server and client) is as:
            // { "url": "", "verb": "", "class": "", "func": ""}
            // url: url pattern to match
            // verb: 
            //  on server, these can be: "get", "post", "put", "delete"
            //  on client, this is not required
            // class: 
            //  on server, the class that can handle this route
            //  on client, the view class that represents this route
            // func: 
            //  on server, the function name of the class that handles this
            //  on client, this is fixed as 'mount'
            routesOrder = _this.settings(routesKey);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = routesOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var routesOf = _step.value;

                    routes = _this.settings(routesOf + routesKey, []);

                    var _loop = function _loop(route) {
                        if (route.url && route.class && route.func) {
                            if (_this.env.isServer) {
                                theRoute = router.route(route.url);
                                if (['get', 'post', 'put', 'delete'].indexOf(verb) === -1) {
                                    throw 'Unknown verb for: ' + route.url;
                                }
                                theRoute[verb](function (req, res) {
                                    theHandler(route.url, verb, route.class, route.func, req, res);
                                });
                            } else {
                                router.add(route.url, function () {
                                    // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                    theHandler(route.url, '', route.class, 'navigate', this, null);
                                });
                            }
                        }
                    };

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = routes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var route = _step2.value;

                            _loop(route);
                        }
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
                }

                // setup hash change trigger on client
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

            if (!_this.env.isServer) {
                window.onhashchange = function () {
                    var url = window.location.hash;
                    if (url.substr(0, 1) === '#') {
                        url = url.substr(1);
                    }
                    router.run(url);
                };
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Router.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ClientRequest.js)
define('sys.core.comm.ClientRequest', [use('sys.core.comm.Request')], function (Request) {
    /**
     * @class sys.core.comm.ClientRequest
     * @classdesc sys.core.comm.ClientRequest
     * @desc Request information (on client).
     */
    return Class('sys.core.comm.ClientRequest', Request, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, req, response, access) {
            base(req, null, access); // no need to send response in a client request, it does not apply here
            _this.url = req.url;
            _this.args = req; // if url is -> abc/:name, .name will be available here
            _this.query = req; // query strings, if any
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ClientRequest.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ClientResponse.js)
define('sys.core.comm.ClientResponse', [use('sys.core.comm.Response')], function (Response) {
    /**
     * @class sys.core.comm.ClientResponse
     * @classdesc sys.core.comm.ClientResponse
     * @desc Response information (on client).
     */
    return Class('sys.core.comm.ClientResponse', Response, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, res, err, data) {
            base(res);
            _this.error = err || null;
            _this.data = data;
            _this.isError = !res.ok;
            _this.isRedirected = res.redirected;
            _this.status = res.status;
            _this.statusText = res.statusText;
        });

        attr('readonly');
        this.prop('isError', false);

        attr('readonly');
        this.prop('isRedirected', false);

        attr('readonly');
        this.prop('status', null);

        attr('readonly');
        this.prop('statusText', '');

        attr('readonly');
        this.prop('error', null);

        attr('readonly');
        this.prop('data', null);

        this.func('getHeader', function (name) {
            _this.res.headers.get(name);
        });
        this.func('getContentType', function () {
            _this.getHeader('Content-Type');
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ClientResponse.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Request.js)
define('sys.core.comm.Request', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.comm.Request
     * @classdesc sys.core.comm.Request
     * @desc Request information.
     */
    return Class('sys.core.comm.Request', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, req, res, access) {
            base();
            _this.access = access;
        });

        attr('readonly');
        this.prop('url', null);

        attr('readonly');
        this.prop('access', null);

        attr('readonly');
        this.prop('query', null);

        attr('readonly');
        this.prop('args', null);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Request.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Response.js)
define('sys.core.comm.Response', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.comm.Response
     * @classdesc sys.core.comm.Response
     * @desc Response information.
     */
    return Class('sys.core.comm.Response', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, res) {
            base();
            _this.res = res;
        });

        attr('protected');
        this.prop('res', null);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Response.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ServerRequest.js)
define('sys.core.comm.ServerRequest', [use('sys.core.comm.Request')], function (Request) {
    /**
     * @class sys.core.comm.ServerRequest
     * @classdesc sys.core.comm.ServerRequest
     * @desc Request information (on server).
     */
    return Class('sys.core.comm.ServerRequest', Request, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, req, response, access) {
            base(req, response, access);
            _this.req = req;
            _this.response = response;
            _this.data = req.body;
            _this.isSecure = req.secure;
            _this.isFresh = req.fresh;
            _this.url = req.originalUrl;
            _this.args = req.params; // if url is -> abc/:name, .name will be available here
            _this.query = req.query; // query strings, if any
        });

        attr('private');
        this.prop('req', null);

        attr('readonly');
        this.prop('response', null);

        attr('readonly');
        this.prop('data', null);

        attr('readonly');
        this.prop('isSecure', false);

        attr('readonly');
        this.prop('isFresh', false);

        this.func('getHeader', function () {
            var _req;

            return (_req = _this.req).get.apply(_req, arguments);
        });
        this.func('getCookie', function (name, isSigned) {
            if (isSigned) {
                return _this.req.signedCookies[name];
            } else {
                return _this.req.cookies[name];
            }
        });
        this.func('isContentType', function () {
            var _req2;

            return (_req2 = _this.req).is.apply(_req2, arguments);
        });
        this.func('accepts', function () {
            var _req3;

            return (_req3 = _this.req).accepts.apply(_req3, arguments);
        });
        this.func('acceptsCharsets', function () {
            var _req4;

            return (_req4 = _this.req).acceptsCharsets.apply(_req4, arguments);
        });
        this.func('acceptsEncodings', function () {
            var _req5;

            return (_req5 = _this.req).acceptsEncodings.apply(_req5, arguments);
        });
        this.func('acceptsLanguages', function () {
            var _req6;

            return (_req6 = _this.req).acceptsLanguages.apply(_req6, arguments);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ServerRequest.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ServerResponse.js)
define('sys.core.comm.ServerResponse', [use('sys.core.comm.Response')], function (Response) {
    /**
     * @class sys.core.comm.ServerResponse
     * @classdesc sys.core.comm.ServerResponse
     * @desc Response information (on server).
     */
    return Class('sys.core.comm.ServerResponse', Response, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, res) {
            base(res);
        });

        attr('readonly');
        this.prop('send', {
            json: function json(_json) {
                var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;

                _this.res.status(status).json(_json);
            },
            data: function data(_data) {
                var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
                // data could be text, buffer, array, object
                _this.res.status(status).send(_data);
            },
            file: function file(fileName) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                return new Promise(function (resolve, reject) {
                    _this.res.sendFile(fileName, options, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            },
            download: function download(fileName, displayName) {
                return new Promise(function (resolve, reject) {
                    _this.res.download(fileName, displayName, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            },
            jsonp: function jsonp(json) {
                var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
                var callbackName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

                if (callbackName) {
                    _this.res.app.set('jsonp callback name', callbackName);
                } // set
                _this.res.status(status).jsonp(json);
                if (callbackName) {
                    _this.res.app.set('jsonp callback name', '');
                } // clear
            },
            redirect: function redirect(path, status) {
                if (status) {
                    _this.res.redirect(status, path);
                } else {
                    _this.res.redirect(path);
                }
            },
            error: function error(status, message) {
                _this.res.status(status).send(message);
            },
            none: function none(status) {
                if (status) {
                    _this.res.status(status).end();
                } else {
                    _this.res.end();
                }
            }
        });

        attr('readonly');
        this.prop('isHeadersSent', function () {
            return _this.res.headersSent;
        });

        this.func('setHeader', function () {
            var _res;

            (_res = _this.res).append.apply(_res, arguments);
        });
        this.func('setCookie', function () {
            var _res2;

            (_res2 = _this.res).cookie.apply(_res2, arguments);
        });
        this.func('clearCookie', function () {
            var _res3;

            (_res3 = _this.res).clearCookie.apply(_res3, arguments);
        });
        this.func('setContentType', function () {
            var _res4;

            (_res4 = _this.res).type.apply(_res4, arguments);
        });
        this.func('setLocal', function (name, value) {
            _this.res.locals[name] = value;
        });
        this.func('getLocal', function (name, defaultValue) {
            return _this.res.locals[name] || defaultValue;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ServerResponse.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Component.js)
define('sys.core.ui.Component', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.ui.Component
     * @classdesc sys.core.ui.Component
     * @desc UI Component base class.
     */
    return Class('sys.core.ui.Component', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, type, parent, args) {
            base();
            _this.type = type;
            _this.parent = parent;
            _this.args = args;
        });

        var _isInit = false;
        attr('async');
        attr('sealed');
        this.func('init', function (resolve, reject) {
            if (_isInit) {
                resolve();return;
            }
            _this.beforeInit().then(function () {
                var template = _this.getUrl('index.html');
                include(['html!' + template]).then(function (html) {
                    // process html
                    // 1. replace all ~/... paths with this component's root url + ...
                    // 2. replace all data.<> with shell.data.<> || view.data.<> || <partial.id>.data.<>
                    // 3. replace all handlers.<> with shell.handlers<> || view.handlers<> || <partial.id>.handlers.<>


                    // build element
                    var template = document.createElement('template');
                    template.innerHTML = html;
                    _this.$el = template.content.firstElementChild;

                    // define host
                    var $host = null;
                    switch (_this.type) {
                        case 'shell':
                            $host = document.querySelector(_this.settings('view.stage', '#stage'));
                            if (!$host) {
                                var $stage = document.createElement('div');
                                $stage.setAttribute('id', 'stage');
                                document.body.append($stage);
                                $host = $stage;
                            }
                            _this.$host = $host;
                            break;
                        case 'view':
                            $host = _this.parent.$el.querySelector(_this.settings('view.container', '#container'));
                            if (!$host) {
                                var $container = document.createElement('div');
                                $container.setAttribute('id', 'container');
                                _this.parent.$el.append($container);
                                $host = $container;
                            }
                            _this.$host = $host;
                            break;
                        case 'partial':
                            // already defined in constructor
                            break;
                    }

                    // init partials
                    var initPartials = function initPartials() {
                        var queryStringToObject = function queryStringToObject(qs) {
                            var parts = qs.split('&'),
                                items = null,
                                args = {};
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = parts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var part = _step.value;

                                    items = part.split('=');
                                    args[items[0]] = items[1].trim();
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

                            return args;
                        };
                        return new Promise(function (_resolve, _reject) {
                            // find partials
                            // a partial is defined in html as:
                            //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                            var $partials = _this.$el.querySelectorAll('[ag-partial]'),
                                partials = [],
                                partialArgs = [],
                                partialObjects = [],
                                className = '',
                                args = null;
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = $partials[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var $partial = _step2.value;

                                    className = use($partial.getAttribute('ag-partial'));
                                    args = $partial.getAttribute('ag-args');
                                    args = args ? queryStringToObject(args) : null;
                                    partials.push(className);
                                    partialArgs.push(args);
                                }

                                // get partials
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

                            include(partials, true).then(function (PartialClasses) {
                                // instantiate all partials
                                var i = 0;
                                var _iteratorNormalCompletion3 = true;
                                var _didIteratorError3 = false;
                                var _iteratorError3 = undefined;

                                try {
                                    for (var _iterator3 = PartialClasses[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                        var PartialClass = _step3.value;

                                        partialObjects.push(new PartialClass(_this, $partials[i], partialArgs[i]));
                                        i++;
                                    }

                                    // init all partials
                                } catch (err) {
                                    _didIteratorError3 = true;
                                    _iteratorError3 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                            _iterator3.return();
                                        }
                                    } finally {
                                        if (_didIteratorError3) {
                                            throw _iteratorError3;
                                        }
                                    }
                                }

                                forAsync(partialObjects, function (__resolve, __reject, partialObject) {
                                    partialObject.init().then(__resolve).catch(__reject);
                                }).then(function () {
                                    _partials = partialObjects;
                                    _resolve();
                                });
                            }).catch(_reject);
                        });
                    };
                    initPartials().then(function () {
                        _this.afterInit().then(function () {
                            _isInit = true;
                            resolve();
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('beforeInit', this.noopAsync);

        attr('async');
        this.func('afterInit', this.noopAsync);

        attr('async');
        this.func('beforeShow', this.noopAsync);

        attr('async');
        this.func('afterShow', this.noopAsync);

        attr('async');
        this.func('beforeHide', this.noopAsync);

        attr('async');
        this.func('afterHide', this.noopAsync);

        var _partials = null;
        this.prop('partials', function () {
            return _partials;
        });

        attr('readonly');
        this.prop('type', '');

        attr('readonly');
        this.prop('parent', null);

        attr('readonly');
        attr('once');
        this.prop('$el', null);

        attr('readonly');
        attr('once');
        this.prop('$host', null);

        attr('readonly');
        attr('once');
        this.prop('args', null);

        var _root = '';
        this.func('url', function () {
            var relativeUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            if (!_root) {
                _root = use(_this._.name, 'server'); // e.g., web.sample.shells.Full --> /web/modules/sample/members/shell/Full.js
                _root = '.' + _root.replace('modules/', '').replace('.js', '') + '/'; // ./web/sample/members/shell/Full/
            }
            if (relativeUrl.substr(0, 1) === '/') {
                relativeUrl = relativeUrl.substr(1);
            }
            return _root + relativeUrl;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Component.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Partial.js)
define('sys.core.ui.Partial', [use('sys.core.ui.Component')], function (Component) {
    /**
     * @class sys.core.ui.Partial
     * @classdesc sys.core.ui.Partial
     * @desc Partial base class.
     */
    return Class('sys.core.ui.Partial', Component, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, parent, $host, args) {
            base('partial', parent, args);
            _this.$host = $host;
        });

        attr('readonly');
        this.prop('id', function () {
            return _this._.id;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Partial.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Shell.js)
define('sys.core.ui.Shell', [use('sys.core.ui.Component')], function (CompositeComponent) {
    /**
     * @class sys.core.ui.Shell
     * @classdesc sys.core.ui.Shell
     * @desc Shell base class.
     */
    return Class('sys.core.ui.Shell', Component, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, args, view) {
            base('shell', null, args);
            _this.view = view;
        });

        attr('readonly');
        this.prop('view', null);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Shell.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Transition.js)
define('sys.core.ui.Transition', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.ui.Transition
     * @classdesc sys.core.ui.Transition
     * @desc Transition base class with default transition.
     */
    return Class('sys.core.ui.Transition', Base, function (attr) {
        this.func('in', function (newView) {
            var currentView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (currentView) {
                currentView.$el.style.display = 'none';
            }
            newView.style.display = 'block';
        });
        this.func('out', function (currentView) {
            var newView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            currentView.$el.style.display = 'none';
            if (newView) {
                newView.$el.style.display = 'block';
            }
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Transition.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/View.js)
define('sys.core.ui.View', [use('[Base]'), use('sys.core.ui.Component'), use('sys.core.ui.Transition'), use('sys/core/libs/rivets{.min}.js')], function (Base, CompositeComponent, Transition, rivets) {
    /**
     * @class sys.core.ui.View
     * @classdesc sys.core.ui.View
     * @desc View base class.
     */
    return Class('sys.core.ui.View', Component, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, Shell) {
            _this.shell = new Shell(null, _this);
            base('view', _this.shell, null);
        });

        attr('readonly');
        this.prop('shell', null);

        // this must be decorated with 'endpoint' attribute after overriding
        // in every derived class, for routing to work and access control of views to kick-in
        this.func('navigate', function (args) {
            _this.args = args;
            _this.push();
        });

        attr('private');
        attr('async');
        this.func('push', function (resolve, reject) {
            if (_this.current !== _this) {
                _this.last = _this.current;
                _this.current = _this;
                var last = _this.last;
                _this.mount();
                if (last) {
                    last.beforeHide().then(function () {
                        _this.beforeShow().then(function () {
                            _this.bind();
                            _this.transition.in(_this, last);
                            last.afterHide().then(function () {
                                last.unbind();
                                last.unmount();
                                _this.afterShow().then(resolve).catch(reject);
                            }).catch(reject);
                        });
                    }).catch(reject);
                } else {
                    _this.beforeShow().then(function () {
                        _this.bind();
                        _this.transition.in(_this);
                        _this.afterShow().then(resolve).catch(reject);
                    }).catch(reject);
                }
            }
        });

        attr('async');
        this.func('back', function (resolve, reject) {
            if (_this.current === _this) {
                _this.beforeHide().then(function () {
                    var last = _this.last;
                    _this.current = null;
                    _this.last = null;
                    if (last) {
                        last.beforeShow().then(function () {
                            last.bind();
                            _this.transition.out(_this, last);
                            _this.afterHide().then(function () {
                                _this.unbind();
                                _this.unmount();
                                last.afterShow().then(resolve).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    } else {
                        _this.transition.out(_this);
                        _this.afterHide().then(function () {
                            _this.unbind();
                            _this.unmount();
                            resolve();
                        }).catch(reject);
                    }
                }).catch(reject);
            }
        });

        this.prop('title', '');

        attr('static');
        this.prop('current', null);

        attr('static');
        this.prop('last', null);

        attr('protected');
        this.func('mount', function () {});

        attr('protected');
        this.prop('data', {
            shell: {},
            view: {}
        });

        attr('private');
        this.prop('bindedView', null);

        attr('protected');
        this.func('bind', function () {
            if (!_this.bindedView) {
                _this.bindedView = rivets.bind(_this.$el, _this.data);
            }
        });

        attr('protected');
        this.func('unbind', function () {
            if (_this.bindedView) {
                _this.bindedView.unbind();
                _this.bindedView = null;
            }
        });

        attr('inject', Transition);
        this.prop('transition', null);

        attr('protected');
        this.func('unmount', function () {});
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/View.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/client/Dependencies.js)
define('sys.core.bootwares.client.Dependencies', [use('[Base]'), use('[IBootware]')], function (Base, IBootware) {
    /**
     * @class sys.core.bootwares.client.Dependencies
     * @classdesc sys.core.bootwares.client.Dependencies
     * @desc Load client-side dependencies.
     */
    return Class('sys.core.bootwares.client.Dependencies', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            var dependencies = _this.settings('dependencies', []);

            // load all dependencies
            // each definition is:
            // "path"
            // path: path of the dependency file
            var deps = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var dep = _step.value;

                    deps.push(use(dep)); // resolve names
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

            include(deps).then(resolve).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/client/Dependencies.js)
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/server/Middlewares.js)
define('sys.core.bootwares.server.Middlewares', [use('[Base]'), use('[IBootware]')], function (Base, IBootware) {
    /**
     * @class sys.core.bootwares.server.Middlewares
     * @classdesc sys.core.bootwares.server.Middlewares
     * @desc Configure server-side middlewares.
     */
    return Class('sys.core.bootwares.server.Middlewares', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            var middlewares = _this.settings('middlewares', []);

            // load all middlewares
            // each definition is:
            // { "name": "", func:"", args": []}
            // name: name of the middleware module
            // func: name of the function of the module that return middleware (optional)
            // args: optional args, if to be passed to middleware
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = middlewares[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    mw = require(use(item.name));
                    if (mw) {
                        if (item.args) {
                            if (item.func) {
                                var _mw;

                                app.use((_mw = mw)[item.func].apply(_mw, _toConsumableArray(item.args)));
                            } else {
                                app.use(mw.apply(undefined, _toConsumableArray(item.args)));
                            }
                        } else {
                            if (item.func) {
                                app.use(mw[item.func]());
                            } else {
                                app.use(mw());
                            }
                        }
                    }
                }

                // dome
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

            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/server/Middlewares.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/server/StaticServer.js)
define('sys.core.bootwares.server.StaticServer', [use('[Base]'), use('[IBootware]'), use('serve-favicon'), use('express')], function (Base, IBootware, favicon, express) {
    /**
     * @class sys.core.bootwares.server.StaticServer
     * @classdesc sys.core.bootwares.server.StaticServer
     * @desc Static content serving configuration.
     */
    return Class('sys.core.bootwares.server.StaticServer', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // configure favicon
            app.use(favicon(use('./web/www/' + _this.settings('static.favIcon', ''))));

            // configure static content serving
            var age = _this.settings('static.caching.age', 0);
            if (_this.settings('static.caching.enabled') && age !== 0) {
                app.use('/', express.static(use('./web/www/'), { maxAge: age }));
                app.use('/', express.static(use('./sys/www/'), { maxAge: age }));
                app.use('/web', express.static(use('./web/modules/'), { maxAge: age }));
                app.use('/sys', express.static(use('./sys/modules/'), { maxAge: age }));
            } else {
                app.use('/', express.static(use('./web/www/')));
                app.use('/', express.static(use('./sys/www/')));
                app.use('/web', express.static(use('./web/modules/')));
                app.use('/sys', express.static(use('./sys/modules/')));
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/server/StaticServer.js)