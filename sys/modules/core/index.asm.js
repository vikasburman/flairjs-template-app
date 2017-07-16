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
            if (!config.env.isProd && _this.raw) {
                _this.stack = _this.raw.stack || _this.raw.responseText;
            }
        });

        this.prop('isServerError', config.env.isServer);
        this.prop('code', config.env.isServer ? 'server_error' : 'client_error');
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

        this.func('navigate', this.noop);

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
    return Class('sys.core.app.Client', App, function (attr) {
        attr('override');
        this.func('navigate', function (base, url) {
            base();
            document.location.hash = url;
        });
    });
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

    /**
     * @param {string} url - url to send to router
     * @return {void} - none
     * @desc Initiate routing for given url.
     */
    this.func('navigate');

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
    return Class('sys.core.app.Server', App, function (attr) {
        attr('override');
        this.func('navigate', function (base, url) {
            base();
            // TODO: via that npm package
        });
    });
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
                    if (Bootware && typeof Bootware === 'function') {
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
                    // nothins as such

                    // done
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', function (resolve, reject) {
            // instantiate app in global variable
            App = as(new ClientApp(), IApp);
            if (!App) {
                reject('Invalid app definition.');return;
            }

            // ready configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    if (Bootware && typeof Bootware === 'function') {
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

                    // start (if not test mode)
                    if (!_this.env.isTest) {
                        App.start().then(function () {
                            console.log(App.title + ' - ' + App.version);

                            // perform default action: open home view
                            App.navigate('home');

                            // done
                            resolve();
                        }).catch(reject);
                    } else {
                        resolve();
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
                    if (Bootware && typeof Bootware === 'function') {
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
                // instantiate app in global variable
                App = as(new ServerApp(_this.app), IApp);
                if (!App) {
                    reject('Invalid app definition.');return;
                }

                // ready configured bootwares
                include(_this.bootwares, true).then(function (items) {
                    forAsync(items, function (_resolve, _reject, Bootware) {
                        if (Bootware && typeof Bootwate === 'function') {
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

                        // start (if not test mode)
                        if (!_this.env.isTest) {
                            App.start().then(function () {
                                console.log(App.title + ' - ' + App.version);

                                // perform default action: assume default is requested
                                App.navigate('/');

                                // done
                                resolve();
                            }).catch(reject);
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
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/boot/Server.js)
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Attributes.js)
define('sys.core.bootwares.Attributes', [use('[Base]'), use('[IBootware]')], function (Base, IBootware) {
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
                        access = opts.access || null,
                        fnArgs = null;
                    descriptor.value = function (request) {
                        // authenticate and serve request
                        return new Promise(function (resolve, reject) {
                            var onAuth = function onAuth() {
                                fnArgs = [resolve, reject, request];
                                fn.apply(undefined, _toConsumableArray(fnArgs));
                            };
                            if (auth) {
                                request.access = access;
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
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', function (resolve, reject) {
            if (!_this.env.isServer) {
                // setup global error handler
                window.onerror = function (desc, url, line, col, err) {
                    this.onError(new ErrorInfo('fatal_error', desc + ' at: ' + url + ', ' + line + ':' + col, '', err));
                };

                // global requirejs error handler
                require.onError = function (err) {
                    this.onError(new ErrorInfo(err));
                };
            }

            // done
            resolve();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/ErrorHandler.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Router.js)
define('sys.core.bootwares.Router', [use('[Base]'), use('[IBootware]'), use('express | sys/core/libs/pathparser{.min}.js'), use('sys.core.comm.ServerRequest | sys.core.comm.ClientRequest'), use('sys.core.comm.Handler')], function (Base, IBootware, RouteManager, Request, Handler) {
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
                routesKey = _this.env.isServer ? ':routesOrder.server' : ':routesOrder.client';

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
            //  on client, this is fixed as 'navigate'
            routesOrder = _this.settings(routesKey);
            routesKey = _this.env.isServer ? ':routes.server' : ':routes.client';
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = routesOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var routesOf = _step.value;

                    routes = _this.settings(routesOf + routesKey, []);

                    var _loop = function _loop(route) {
                        if (route.url && route.class) {
                            if (_this.env.isServer) {
                                if (route.func && route.verb) {
                                    theRoute = router.route(route.url);
                                    if (['get', 'post', 'put', 'delete'].indexOf(route.verb) === -1) {
                                        throw 'Unknown verb for: ' + route.url;
                                    }
                                    theRoute[route.verb](function (req, res) {
                                        var request = new Request(route.verb, req, res),
                                            handler = new Handler(route.class, route.func);
                                        handler.handle(request).catch(function (err) {
                                            throw err;
                                        });
                                    });
                                } else {
                                    throw 'Invalid route definiton: ' + url + '#' + verb;
                                }
                            } else {
                                router.add(route.url, function () {
                                    // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                    var request = new Request(route.url, this),
                                        handler = new Handler(route.class, 'navigate');
                                    handler.handle(request).catch(function (err) {
                                        throw err;
                                    });
                                });
                            }
                        } else {
                            throw 'Invalid route definiton: ' + url + '#' + verb;
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
        attr('override');
        attr('sealed');
        this.func('constructor', function (base, url, args) {
            base(url, args);
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
            _this.isError = err ? true : false;
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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Handler.js)
define('sys.core.comm.Handler', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.comm.Handler
     * @classdesc sys.core.comm.Handler
     * @desc Handler information.
     */
    return Class('sys.core.comm.Handler', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, className, funcName) {
            base();
            _this.className = className;
            _this.funcName = funcName;
        });

        attr('private');
        this.prop('className', null);

        attr('private');
        this.prop('funcName', null);

        attr('async');
        this.func('handle', function (resolve, reject, request) {
            include([use(_this.className)]).then(function (Handler) {
                var handler = new Handler(),
                    handlerInfo = Reflector.get(handler),
                    funcInfo = handlerInfo.getMember(_this.funcName);
                if (!funcInfo || funcInfo.getMemberType() !== 'func' || !funcInfo.hasAttribute('endpoint')) {
                    throw _this.env.isServer ? 'Invalid handler endpoint for: ' + request.url + '#' + request.verb : 'Invalid handler endpoint for: ' + request.url;
                }
                handler[_this.funcName](request).then(resolve).catch(reject);
            }).catch(reject);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Handler.js)
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
        this.func('constructor', function (base, url, args) {
            base();
            _this.url = url;
            _this.args = args; // if url is -> abc/:name, .name will be available here
        });

        attr('readonly');
        this.prop('url', '');

        attr('readonly');
        this.prop('args', null);

        attr('readonly');
        attr('once');
        this.prop('access', null);

        attr('readonly');
        attr('once');
        this.prop('query', null);
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
define('sys.core.comm.ServerRequest', [use('sys.core.comm.Request'), use('sys.core.comm.ServerResponse')], function (Request, Response) {
    /**
     * @class sys.core.comm.ServerRequest
     * @classdesc sys.core.comm.ServerRequest
     * @desc Request information (on server).
     */
    return Class('sys.core.comm.ServerRequest', Request, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, verb, req, res) {
            base(req.originalUrl, req.params);
            _this.verb = verb;
            _this.req = req;
            _this.res = res;
            _this.response = new Response(res);
            _this.data = req.body;
            _this.isSecure = req.secure;
            _this.isFresh = req.fresh;
            _this.query = _this.env.queryStringToObject(req.query); // query strings, if any
        });

        attr('private');
        this.prop('verb', '');

        attr('private');
        this.prop('req', null);

        attr('private');
        this.prop('res', null);

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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Adapter.js)
define('sys.core.ui.Adapter', [use('[Base]'), use('sys/core/libs/rivets{.min}.js')], function (Base, rivets) {
    /**
     * @class sys.core.ui.Adapter
     * @classdesc sys.core.ui.Adapter
     * @desc Adapter base class to define custom adapters for rivets.
     */
    return Class('sys.core.ui.Adapter', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base) {
            base();

            // validate
            if (!_this.name) {
                throw 'Adapter name is not defined. (' + _this._.name + ')';
            }

            // define adapter
            if (!rivets.adapters[_this.name]) {
                rivets.adapters[_this.name] = {
                    observe: _this.observe,
                    unobserve: _this.unobserve,
                    get: _this.get,
                    set: _this.set
                };
            }
        });

        this.prop('name', '');
        this.func('observe', this.noop);
        this.func('unobserve', this.noop);
        this.func('get', this.noop);
        this.func('set', this.noop);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Adapter.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Binder.js)
define('sys.core.ui.Binder', [use('[Base]'), use('sys/core/libs/rivets{.min}.js')], function (Base, rivets) {
    /**
     * @class sys.core.ui.Binder
     * @classdesc sys.core.ui.Binder
     * @desc Binder base class to define custom binders for rivets.
     */
    return Class('sys.core.ui.Binder', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base) {
            base();

            // validate
            if (!_this.name) {
                throw 'Binder name is not defined. (' + _this._.name + ')';
            }

            // define binder
            if (!rivets.binders[_this.name]) {
                if (!_this.isTwoWay) {
                    // one-way binder
                    rivets.binders[_this.name] = _this.routine;
                } else {
                    // two-way binder
                    rivets.binders[_this.name] = {
                        bind: _this.bind,
                        unbind: _this.unbind,
                        routine: _this.routine,
                        getValue: _this.getValue,
                        publishes: _this.publishes,
                        block: _this.block
                    };
                }
            }
        });

        this.prop('name', '');
        this.func('bind', this.noop);
        this.func('unbind', this.noop);
        this.func('routine', this.noop);
        this.func('getValue', this.noop);
        this.func('isTwoWay', false);
        this.prop('publishes', false);
        this.prop('block', false);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Binder.js)
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
        attr('sealed');
        attr('async');
        this.func('init', function (resolve, reject) {
            if (_isInit) {
                resolve();return;
            }
            var defineHost = function defineHost() {
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
            };
            var loadHtml = function loadHtml() {
                return new Promise(function (resolve, reject) {
                    var template = _this.url('index.html');
                    include([template]).then(function (html) {
                        // process html
                        // 1. replace all {.min}.<> with .min.<> or .<> as per debug mode
                        // 2. replace all ~/<> paths with this component's root url + <>
                        // 3. replace all @:<> with shell.<> || view.<> || partials.<partial.id>.<>
                        html = replaceAll(html, '{.min}', _this.env.isProd ? '.min' : '');
                        html = replaceAll(html, '~/', _this.url());
                        switch (_this.type) {
                            case 'shell':
                                html = replaceAll(html, '@:', 'shell.');
                                break;
                            case 'view':
                                html = replaceAll(html, '@:', 'view.');
                                break;
                            case 'partial':
                                html = replaceAll(html, '@:', 'partials.' + _this._.id + '.');
                                break;
                        }

                        // build element
                        var template = document.createElement('template');
                        template.innerHTML = html;
                        _this.$el = template.content.firstElementChild;
                        _this.$el.setAttribute('id', _this._.id);

                        // done
                        resolve();
                    }).catch(reject);
                });
            };
            var initPartials = function initPartials() {
                return new Promise(function (_resolve, _reject) {
                    // find partials
                    // a partial is defined in html as:
                    //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                    var $partials = _this.$el.querySelectorAll('[ag-partial]'),
                        partials = [],
                        partialClassParams = [],
                        partialObjects = [],
                        className = '',
                        args = null;
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = $partials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var $partial = _step.value;

                            className = use($partial.getAttribute('ag-partial'));
                            args = $partial.getAttribute('ag-args');
                            args = args ? _this.env.queryStringToObject(args) : null;
                            partials.push(className);
                            partialClassParams.push({ $host: $partial, args: args });
                        }

                        // get partials
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

                    include(partials, true).then(function (PartialClasses) {
                        // instantiate all partials
                        if (PartialClasses) {
                            var i = 0,
                                pa = null;
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = PartialClasses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var PartialClass = _step2.value;

                                    pa = partialClassParams[i];
                                    partialObjects.push(new PartialClass(_this, pa.$host, pa.args));
                                    i++;
                                }

                                // init all partials
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

                            forAsync(partialObjects, function (__resolve, __reject, partialObject) {
                                partialObject.init().then(__resolve).catch(__reject);
                            }).then(function () {
                                _partials = partialObjects;
                                _resolve();
                            }).catch(_reject);
                        } else {
                            _resolve();
                        }
                    }).catch(_reject);
                });
            };
            var loadDeps = function loadDeps() {
                return new Promise(function (resolve, reject) {
                    // deps are defined on main node as <div ag-deps="..., ..., ..."></div>
                    // each dep is scoped to current component's home url and are seperated by a ','
                    var deps = _this.$el.getAttribute('ag-deps');
                    if (deps) {
                        var items = deps.split(','),
                            styles = [],
                            others = [];
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var item = _step3.value;

                                item = _this.url(item); // add relativity
                                if (item.startsWith('text!')) {
                                    styles.push(item);
                                } else {
                                    others.push(item);
                                }
                            }
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

                        include(others).then(function () {
                            include(styles, true).then(function (allStyles) {
                                if (allStyles) {
                                    var _iteratorNormalCompletion4 = true;
                                    var _didIteratorError4 = false;
                                    var _iteratorError4 = undefined;

                                    try {
                                        for (var _iterator4 = allStyles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                            var thisStyle = _step4.value;

                                            if (thisStyle) {
                                                _styles += '\n/* next */\n' + thisStyle;
                                            }
                                        }
                                    } catch (err) {
                                        _didIteratorError4 = true;
                                        _iteratorError4 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                                _iterator4.return();
                                            }
                                        } finally {
                                            if (_didIteratorError4) {
                                                throw _iteratorError4;
                                            }
                                        }
                                    }
                                }
                                resolve();
                            }).catch(reject);
                        }).catch(reject);
                    } else {
                        resolve();
                    }
                });
            };

            // init
            _this.beforeInit().then(function () {
                loadHtml().then(function () {
                    defineHost();
                    loadDeps().then(function () {
                        initPartials().then(function () {
                            _this.afterInit().then(function () {
                                _isInit = true;
                                resolve();
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });

        attr('protected');
        attr('async');
        this.func('beforeInit', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('afterInit', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('beforeShow', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('afterShow', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('beforeHide', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('afterHide', this.noopAsync);

        var _partials = null;
        this.prop('partials', function () {
            return _partials;
        });

        var _styles = '';
        this.prop('styles', function () {
            return _styles;
        });

        attr('protected');
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

        this.prop('$style', null);

        var _root = '';
        this.func('url', function () {
            var relativeUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            if (!_root) {
                _root = use(_this._.name, 'server'); // e.g., web.sample.shells.Full --> /web/modules/sample/members/shell/Full.js
                _root = _root.replace('modules/', '').replace('.js', '') + '/'; // /web/sample/members/shell/Full/
            }
            if (relativeUrl.substr(0, 1) === '/') {
                relativeUrl = relativeUrl.substr(1);
            }

            // add correct loader
            var _path = _root + relativeUrl;
            if (_path.endsWith('.css')) {
                _path = 'text!' + _path;
            } else if (_path.endsWith('.html')) {
                _path = 'text!' + _path;
            }
            return _path;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Component.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Formatter.js)
define('sys.core.ui.Formatter', [use('[Base]'), use('sys/core/libs/rivets{.min}.js')], function (Base, rivets) {
    /**
     * @class sys.core.ui.Formatter
     * @classdesc sys.core.ui.Formatter
     * @desc Formatter base class to define custom formatters for rivets.
     */
    return Class('sys.core.ui.Formatter', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base) {
            base();

            // validate
            if (!_this.name) {
                throw 'Formatter name is not defined. (' + _this._.name + ')';
            }

            // define formatter
            if (!rivets.formatters[_this.name]) {
                if (!_this.isTwoWay) {
                    // one-way formatter
                    rivets.formatters[_this.name] = _this.read;
                } else {
                    // two-way formatter
                    rivets.formatters[_this.name] = {
                        read: _this.read,
                        publish: _this.publish
                    };
                }
            }
        });

        this.prop('name', '');
        this.func('read', this.noop);
        this.func('publish', this.noop);
        this.func('isTwoWay', false);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Formatter.js)
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

        attr('async');
        this.func('cfas', function (resolve, reject, asyncFuncName) {
            for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                args[_key - 3] = arguments[_key];
            }

            var callOnPartials = function callOnPartials(obj) {
                return new Promise(function (_resolve, _reject) {
                    if (obj.partials) {
                        forAsync(obj.partials, function (__resolve, __reject, partial) {
                            partial.cfas.apply(partial, [asyncFuncName].concat(args)).then(__resolve).catch(__reject);
                        }).then(_resolve).catch(_reject);
                    } else {
                        _resolve();
                    }
                });
            };

            // cumulative function call (async)
            if (typeof _this[asyncFuncName] === 'function') {
                _this[asyncFuncName].apply(_this, args).then(function () {
                    callOnPartials(_this).then(resolve).catch(reject);
                }).catch(reject);
            } else {
                resolve();
            }
        });

        this.func('cfs', function (syncFuncName) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            var callOnPartials = function callOnPartials(obj) {
                if (obj.partials) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = obj.partials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var partial = _step.value;

                            partial.cfs.apply(partial, [syncFuncName].concat(args));
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
            };

            // cumulative function call (sync)
            if (typeof _this[syncFuncName] === 'function') {
                _this[syncFuncName].apply(_this, args);
            }
            callOnPartials(_this);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Partial.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Shell.js)
define('sys.core.ui.Shell', [use('sys.core.ui.Component')], function (Component) {
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

        attr('protected');
        this.prop('view', null);

        attr('async');
        this.func('cfas', function (resolve, reject, asyncFuncName) {
            for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                args[_key - 3] = arguments[_key];
            }

            var callOnPartials = function callOnPartials(obj) {
                return new Promise(function (_resolve, _reject) {
                    if (obj.partials) {
                        forAsync(obj.partials, function (__resolve, __reject, partial) {
                            partial.cfas.apply(partial, [asyncFuncName].concat(args)).then(__resolve).catch(__reject);
                        }).then(_resolve).catch(_reject);
                    } else {
                        _resolve();
                    }
                });
            };

            // cumulative function call (async)
            if (typeof _this[asyncFuncName] === 'function') {
                _this[asyncFuncName].apply(_this, args).then(function () {
                    callOnPartials(_this).then(resolve).catch(reject);
                }).catch(reject);
            } else {
                resolve();
            }
        });

        this.func('cfs', function (syncFuncName) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            var callOnPartials = function callOnPartials(obj) {
                if (obj.partials) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = obj.partials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var partial = _step.value;

                            partial.cfs.apply(partial, [syncFuncName].concat(args));
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
            };

            // cumulative function call (sync)
            if (typeof _this[syncFuncName] === 'function') {
                _this[syncFuncName].apply(_this, args);
            }
            callOnPartials(_this);
        });
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
            newView.$el.style.display = 'block';
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
define('sys.core.ui.View', [use('[Base]'), use('sys.core.ui.Component'), use('sys.core.ui.Transition'), use('sys.core.bootwares.client.DataBinder')], function (Base, Component, DefaultTransition, DataBinder) {
    /**
     * @class sys.core.ui.View
     * @classdesc sys.core.ui.View
     * @desc View base class.
     */
    return Class('sys.core.ui.View', Component, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, Shell, Transition) {
            _this.shell = new Shell(null, _this);
            base('view', _this.shell, null);
            if (Transition) {
                _this.transition = new Transition();
            } else {
                _this.transition = new DefaultTransition();
            }
        });

        attr('protected');
        this.prop('shell', null);

        attr('protected');
        this.prop('request', null);

        // this must be decorated with 'endpoint' attribute after overriding
        // in every derived class, for routing to work and access control of view to kick-in
        attr('async');
        this.func('navigate', function (resolve, reject, request) {
            if (request) {
                _this.request = request;
                _this.args = request.args;
                _this.stage().then(resolve).catch(reject);
            } else {
                reject('request not defined.');
            }
        });

        attr('async');
        attr('sealed');
        this.func('back', function (resolve, reject) {
            if (_this.current === _this) {
                // sequence
                //  this beforeHide
                // (partials are processed along with shell/view)
                // EITHER (if last view exists)
                //  last beforeShow
                //  last mount
                //  last bind
                //  transtion last in and this out
                //  this afterHide
                //  this unbind
                //  this unmount
                //  last afterShow
                // OR (when last view does not exists)
                //  transtion this out
                //  this afterHide
                //  this unbind
                //  this unmount
                _this.cfas('beforeHide').then(function () {
                    var last = _this.last;
                    _this.current = last;
                    _this.last = null;
                    if (last) {
                        last.cfas('beforeShow').then(function () {
                            last.cfs('mount');
                            last.cfs('bind');
                            _this.transition.out(_this, last);
                            _this.cfas('afterHide').then(function () {
                                _this.cfs('unbind');
                                _this.cfs('unmount');
                                last.cfas('afterShow').then(resolve).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    } else {
                        _this.transition.out(_this);
                        _this.cfas('afterHide').then(function () {
                            _this.cfs('unbind');
                            _this.cfs('unmount');
                            resolve();
                        }).catch(reject);
                    }
                }).catch(reject);
            }
        });

        attr('private');
        attr('async');
        this.func('stage', function (resolve, reject) {
            if (_this.current !== _this) {
                _this.last = _this.current;
                _this.current = _this;
                var last = _this.last;
                // sequence
                // (partials are processed along with shell/view)
                // this init
                // EITHER (if last view exists)
                //  last beforeHide
                //  this beforeShow
                //  this mount
                //  this bind
                //  transtion this in and last out
                //  last afterHide
                //  last unbind
                //  last unmount
                //  this afterShow
                // OR (when last view does not exists)
                //  this beforeShow
                //  this mount
                //  this bind
                //  transtion this in
                //  this afterShow
                _this.shell.init().then(function () {
                    _this.init().then(function () {
                        if (last) {
                            last.cfas('beforeHide').then(function () {
                                _this.cfas('beforeShow').then(function () {
                                    _this.cfs('mount');
                                    _this.cfs('bind');
                                    _this.transition.in(_this, last);
                                    last.cfas('afterHide').then(function () {
                                        last.cfs('unbind');
                                        last.cfs('unmount');
                                        _this.cfas('afterShow').then(resolve).catch(reject);
                                    }).catch(reject);
                                });
                            }).catch(reject);
                        } else {
                            _this.cfas('beforeShow').then(function () {
                                _this.cfs('mount');
                                _this.cfs('bind');
                                _this.transition.in(_this);
                                _this.cfas('afterShow').then(resolve).catch(reject);
                            }).catch(reject);
                        }
                    }).catch(reject);
                }).catch(reject);
            } else {
                resolve();
            }
        });

        attr('private');
        this.prop('transition', null);

        attr('private');
        this.prop('current', function () {
            return _this.env.get('currentView', null);
        }, function (view) {
            _this.env.set('currentView', view);
        });

        attr('private');
        this.prop('last', null);

        attr('protected');
        attr('sealed');
        this.func('mount', function () {
            // mount styles
            var mountStyles = function mountStyles(obj) {
                if (obj.styles) {
                    obj.$style = document.createElement('style');
                    obj.$style.setAttribute('scoped', '');
                    obj.$style.appendChild(document.createTextNode(obj.styles));
                    obj.$el.prepend(obj.$style);
                }
            };

            // mount partials
            var mountPartial = function mountPartial(partial) {
                partial.$host.append(partial.$el);
                mountStyles(partial);
                mountPartials(partial.partials);
            };
            var mountPartials = function mountPartials(partials) {
                if (partials) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = partials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var partial = _step.value;

                            mountPartial(partial);
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
            };

            // mount shell to stage
            _this.shell.$host.append(_this.shell.$el);
            mountStyles(_this.shell);
            mountPartials(_this.shell.partials);

            // mount view to shell container
            _this.$host.append(_this.$el);
            mountStyles(_this);
            mountPartials(_this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', function () {
            if (_isMounted) {
                _isMounted = false;

                // unmount styles
                var unmountStyles = function unmountStyles(obj) {
                    if (obj.$style) {
                        obj.$style.remove();
                    }
                };

                // unmount partials
                var unmountPartial = function unmountPartial(partial) {
                    unmountStyles(partial);
                    partial.$el.remove();
                    unmountPartials(partial.partials);
                };
                var unmountPartials = function unmountPartials(partials) {
                    if (partials) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = partials[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var partial = _step2.value;

                                unmountPartial(partial);
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
                };

                // unmount view from shell container
                unmountStyles(_this);
                _this.$el.remove();
                unmountPartials(_this.partials);

                // unmount shell from stage
                unmountStyles(_this.shell);
                _this.shell.$el.remove();
                unmountPartials(_this.shell.partials);
            }
        });

        var _bindedView = null;
        attr('protected');
        attr('sealed');
        this.func('bind', function () {
            if (!_bindedView) {
                var getPartialBindings = function getPartialBindings(target, _obj) {
                    if (_obj.partials) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = _obj.partials[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var partial = _step3.value;

                                target[partial._.id] = partial;
                                getPartialBindings(target, partial);
                            }
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
                    }
                };

                // get bindings
                var obj = {
                    partials: {},
                    shell: _this.shell,
                    view: _this
                };
                getPartialBindings(obj.partials, _this.shell);
                getPartialBindings(obj.partials, _this);

                // bind
                var binder = new DataBinder(); // its singleton, so no issue
                _bindedView = binder.bind(_this.shell.$el, obj);
            }
        });

        attr('protected');
        attr('sealed');
        this.func('unbind', function () {
            if (_bindedView) {
                var binder = new DataBinder(); // its singleton, so no issue
                binder.unbind(_bindedView);
                _bindedView = null;
            }
        });

        attr('async');
        this.func('cfas', function (resolve, reject, asyncFuncName) {
            for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                args[_key - 3] = arguments[_key];
            }

            var _parent;

            var callOnPartials = function callOnPartials(obj) {
                return new Promise(function (_resolve, _reject) {
                    if (obj.partials) {
                        forAsync(obj.partials, function (__resolve, __reject, partial) {
                            partial.cfas.apply(partial, [asyncFuncName].concat(args)).then(__resolve).catch(__reject);
                        }).then(_resolve).catch(_reject);
                    } else {
                        _resolve();
                    }
                });
            };

            // cumulative function call (async)
            (_parent = _this.parent).cfas.apply(_parent, [asyncFuncName].concat(args)).then(function () {
                if (typeof _this[asyncFuncName] === 'function') {
                    _this[asyncFuncName].apply(_this, args).then(function () {
                        callOnPartials(_this).then(resolve).catch(reject);
                    }).catch(reject);
                } else {
                    resolve();
                }
            }).catch(reject);
        });

        this.func('cfs', function (syncFuncName) {
            var _parent2;

            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            var callOnPartials = function callOnPartials(obj) {
                if (obj.partials) {
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = obj.partials[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var partial = _step4.value;

                            partial.cfs.apply(partial, [syncFuncName].concat(args));
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                }
            };

            // cumulative function call (sync)
            (_parent2 = _this.parent).cfs.apply(_parent2, [syncFuncName].concat(args));
            if (typeof _this[syncFuncName] === 'function') {
                _this[syncFuncName].apply(_this, args);
            }
            callOnPartials(_this);
        });

        this.prop('title', '');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/View.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/client/DataBinder.js)
define('sys.core.bootwares.client.DataBinder', [use('[Base]'), use('[IBootware]')], function (Base, IBootware) {
    /**
     * @class sys.core.bootwares.client.DataBinder
     * @classdesc sys.core.bootwares.client.DataBinder
     * @desc Load client-side data inding configuration.
     */
    return Class('sys.core.bootwares.client.DataBinder', Base, [IBootware], function (attr) {
        var _this = this;

        attr('singleton');
        attr('override');
        this.func('constructor', function (base) {
            base();
        });

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // setup shim for require
            var shimFor = { name: 'rivets', path: 'sys/core/libs/rivets{.min}.js' },
                shimDeps = [{ name: 'sightglass', path: 'sys/core/libs/sightglass{.min}.js' }];
            _this.env.addShim(shimFor, shimDeps);

            // load rivets
            include([use('rivets')]).then(function (rivets) {
                // set
                _this.rivets = rivets;

                // configuration
                var rivetsConfig = _this.settings('rivets.config', null);
                if (rivetsConfig) {
                    rivets.configure(rivetsConfig);
                }

                // custom binders
                // TODO

                // done
                resolve();
            }).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);

        attr('private');
        this.prop('rivets', null);

        this.func('bind', function ($el, obj) {
            return rivets.bind($el, obj);
        });
        this.func('unbind', function (bindedView) {
            bindedView.unbind();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/client/DataBinder.js)
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

            forAsync(deps, function (resolve, reject, dep) {
                _this.env.loadScript(dep).then(resolve).catch(reject);
            }).then(resolve).catch(reject);
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
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/formatters/Percent.js)
define('sys.core.ui.formatters.Percent', [use('sys.core.ui.Formatter')], function (Formatter) {
    /**
     * @class sys.core.ui.formatters.Percent
     * @classdesc sys.core.ui.formatters.Percent
     * @desc Percent formatter, adds % symbol to given value.
     */
    return Class('sys.core.ui.formatters.Percent', Formatter, function (attr) {
        this.prop('name', 'percent');

        attr('override');
        this.func('read', function (value) {
            return value + '%';
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/formatters/Percent.js)