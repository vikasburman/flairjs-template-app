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

        attr('protected');
        this.func('errorText', function (err, list) {
            var errCode = 'default',
                errText = 'Unknown error. (' + err + ')';
            if (err) {
                if (typeof err === 'string' || typeof err === 'number') {
                    // just any error code
                    errCode = err.toString();
                    errText = 'Error: ' + errCode;
                } else if (err.code) {
                    // ErrorInfo object
                    errCode = err.code;
                    errText = 'Error: ' + err.desc;
                } else if (err.error) {
                    // ClientResponse object
                    if (err.error.code) {
                        // ErrorInfo object inside clientResponse object
                        errCode = err.error.code;
                        errText = 'Error: ' + err.desc;
                    } else {
                        errCode = err.error;
                    }
                }
            }
            if (list) {
                if (list[errCode]) {
                    errText = list[errCode];
                } else if (errCode !== 'default' && list['default']) {
                    errText = list['default'];
                }
            }
            return errText;
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
            _this.info = _this.settings(':app');
        });

        attr('async');
        this.func('start', this.noopAsync);

        this.func('navigate', this.noop);

        attr('readonly');
        this.prop('info', {});
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
        this.func('navigate', function (base, url, returnUrlORisReplace) {
            base();
            var currentHash = document.location.hash.replace('#', '');
            if (typeof returnUrlORisReplace === 'string') {
                url += '?returnUrl=' + returnUrlORisReplace;
                if (url.substr(0, 1) === '#') {
                    url = url.substr(1);
                }
                document.location.replace('#' + url);
            } else if (typeof returnUrlORisReplace === 'boolean' && returnUrlORisReplace) {
                if (url.substr(0, 1) === '#') {
                    url = url.substr(1);
                }
                document.location.replace('#' + url);
            } else {
                document.location.hash = url;
            }
            if (currentHash === url) {
                // trigger onhashchange manually, since same hash was already there
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
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
     * @param {string} url - url to send to router
     * @return {void} - none
     * @desc Initiate routing for given url.
     */
    this.func('navigate');

    /**
     * @desc App level info defined to describe various aspects of app in app settings in config.json
     */
    this.prop('info');
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
                            console.log(App.info.title + ' - ' + App.info.version);

                            // perform default action: open home view or currently opened view
                            var url = document.location.hash.replace('#', '') || '/';
                            App.navigate(url);

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
                        var _port = _this.settings('port.prod', 443);
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
                                console.log(App.info.title + ' - ' + App.info.version);

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
define('sys.core.bootwares.Attributes', [use('[Base]'), use('[IBootware]'), use('[Auth]'), use('sys.core.comm.ClientResponse')], function (Base, IBootware, Auth, FetchResponse) {
    /**
     * @class sys.core.bootwares.Attributes
     * @classdesc sys.core.bootwares.Attributes
     * @desc Define global framework attributes.
     */
    return Class('sys.core.bootwares.Attributes', Base, [IBootware], function (attr) {
        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // service
            // service(url, [options])
            //  url: can be relative, full or url pattern with /:<key> as part of url
            //  options: can be a literal having:
            //      - enableCookies: true (for same origin), false (no cookies sent), all (even for cross-origin calls)
            //      - requestDataType: any of the possible Content-Type (this sets Content-Type header itself)
            //      - responseDataType: text, json, blob, buffer, formData, objectUrl
            //      - pre: can be a function where all passed args are send for pre-processing before fetch is called
            //        pre function is passed a structure { 
            //          url: <-- if url contains '/:' type fillers, this contains the first arg passed to wrapped function (which could be a structure or one single string)
            //          body: <-- if url fillers are given, this will be second arg passsed, else first arg itself
            //        }
            //        pre is generally used to pre-process arg values, e.g., serialize structures or give proper structure to fill values, etc.
            //      - auth: can be any of these three values
            //          'none': (or absence of this key itself), means no auth data to be send
            //          'auto': automatically picks the auth header from the session (only on client, throws on server)
            //          fn: a function reference, that gives access headers for fetch operation (key-value pairs returned from here are added under headers)
            //      - Additionally it can have everything else that 'init' option of fetch request looks for (https://developer.mozilla.org/en/docs/Web/API/Fetch_API)
            Container.register(Class('service', Attribute, function () {
                var _this = this;

                this.decorator(function (obj, type, name, descriptor) {
                    // validate
                    if (['func'].indexOf(type) === -1) {
                        throw 'service attribute cannot be applied on ' + type + ' members. (' + name + ')';
                    }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) {
                        throw 'service attribute cannot be applied on special function. (' + name + ')';
                    }

                    // decorate
                    var fetchUrl = _this.args[0] || '',
                        staticOpts = _this.args[1] || {},
                        fn = descriptor.value,
                        fnArgs = null,
                        inputArgs = {},
                        enableCookies = staticOpts.enableCookies || false,
                        responseDataType = staticOpts.responseDataType || null,
                        requestDataType = staticOpts.requestDataType || null,
                        auth = staticOpts.auth || null;
                    if (staticOpts.responseDataType) {
                        delete staticOpts.responseDataType;
                    }
                    if (staticOpts.requestDataType) {
                        delete staticOpts.requestDataType;
                    }
                    if (staticOpts.auth) {
                        delete staticOpts.auth;
                    }
                    if (staticOpts.enableCookies) {
                        delete staticOpts.enableCookies;
                    }
                    descriptor.value = function (urlFillsOrInputData, inputData) {
                        var _this2 = this;

                        _fetchUrl = fetchUrl;
                        if (_fetchUrl.indexOf('/:') === -1) {
                            // e.g., items/:id or http://www.abc.com/items/:type/:id or /home#/pages/:page
                            inputArgs.body = urlFillsOrInputData; // that means, only inputData is passed as first argument and not urlFills
                        } else {
                            inputArgs.urlFills = urlFillsOrInputData;
                            inputArgs.body = inputData;
                        }

                        // fetch
                        return new Promise(function (resolve, reject) {
                            // actual fetch
                            var doFetch = function doFetch() {
                                var updatedBody = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

                                return new Promise(function (_resolve, _reject) {
                                    var onFetch = function onFetch(err, response, data) {
                                        var _response = new FetchResponse(response, err, data);
                                        if (err) {
                                            _reject(_response);
                                        } else {
                                            _resolve(_response);
                                        }
                                    };

                                    // build url
                                    if (inputArgs.urlFills) {
                                        for (var fill in inputArgs.urlFills) {
                                            if (inputArgs.urlFills.hasOwnProperty(fill)) {
                                                _fetchUrl = _fetchUrl.replace('/:' + fill, encodeURIComponent('/' + inputArgs.urlFills[fill].toString()));
                                            }
                                        }
                                    }

                                    // update body
                                    if (updatedBody) {
                                        inputArgs.body = updatedBody;
                                    }

                                    // prepare call options
                                    if (_fetchUrl) {
                                        // staticOpts: can be all that fetch's init argument expects
                                        //             additionally it can have
                                        if (inputArgs.body) {
                                            if (requestDataType) {
                                                if (staticOpts.headers && staticOpts.headers['Content-Type']) {
                                                    // both are defined, give Conteny-Type precedence and ignore requestDataType
                                                } else {
                                                    staticOpts.headers = staticOpts.headers || {};
                                                    staticOpts.headers['Content-Type'] = requestDataType;
                                                }
                                            }
                                            if (staticOpts.headers && staticOpts.headers['Content-Type'] && staticOpts.headers['Content-Type'].indexOf('json') !== -1) {
                                                staticOpts.body = JSON.stringify(inputArgs.body); // json
                                            } else {
                                                staticOpts.body = inputArgs.body; // could be text, buffer, array, object or formData
                                            }
                                        }

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

                                        // locale
                                        staticOpts.headers = staticOpts.headers || {};
                                        staticOpts.headers.userLocale = _this2.env.getLocale(); // this is full locale object

                                        // auth
                                        if (auth) {
                                            var applyHeaders = function applyHeaders(authHeaders) {
                                                for (var authHeader in authHeaders) {
                                                    if (authHeaders.hasOwnProperty(authHeader)) {
                                                        staticOpts.headers = staticOpts.headers || {};
                                                        staticOpts.headers[authHeader] = authHeaders[authHeader];
                                                    }
                                                }
                                            };
                                            if (typeof auth === 'function') {
                                                auth(name).then(function (authHeaders) {
                                                    applyHeaders(authHeaders);
                                                }).catch(function (err) {
                                                    onFetch(err, null, null);
                                                });
                                            } else if (typeof auth === 'string' && auth === 'auto') {
                                                if (_this2.env.isServer) {
                                                    onFetch('invalid auth settings for server.', null, null);
                                                } else {
                                                    var _auth = new Auth();
                                                    applyHeaders(_auth.getTokenHeader());
                                                }
                                            } else {
                                                onFetch('invalid auth settings.', null, null);
                                            }
                                        }
                                    } else {
                                        onFetch('invalid fetch url', null, null);
                                    }

                                    // actual call
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
                                });
                            };

                            // helper methods
                            doFetch.updateUrl = function (urlFills) {
                                inputArgs.urlFills = urlFills;
                            };
                            doFetch.updateData = function (updatedBody) {
                                // updated body can also be provided via direct doFetch() call
                                inputArgs.body = updatedBody;
                            };

                            fnArgs = [doFetch, resolve, reject, inputArgs.body];
                            fn.apply(undefined, _toConsumableArray(fnArgs));
                        });
                    }.bind(obj);
                });
            }));

            // claims
            // claims(comma delimited list of claimName)
            //  claimName can be anything as per app's need
            //  one special claimName is:
            //      auth - to represent only authenticated user and no other special claim for the end-point
            //             when this is defined, this must be the only claim, else it is ignored
            //             auth is not required to be added with other claims, because while checking other
            //             claims, auth is automatically checked
            //  claims can also include OR and AND logic
            //  to have OR relationship among claims, put them in the same claimName string
            //  to have AND relationship among claims, put them as a seperate claimName string
            //  e.g., all of these are valid examples (NOTE: only one claims attribute is allowed)
            //  attr('claims', 'auth');
            //  attr('claims', 'name1', 'name2 || name3'); // means name1 AND (name2 OR name3)
            Container.register(Class('claims', Attribute, function () {
                var _this3 = this;

                this.decorator(function (obj, type, name, descriptor) {
                    // validate
                    if (['func'].indexOf(type) === -1) {
                        throw 'claims attribute cannot be applied on ' + type + ' members. (' + name + ')';
                    }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) {
                        throw 'claims attribute cannot be applied on special function. (' + name + ')';
                    }

                    // decorate
                    var fn = descriptor.value,
                        claims = _this3.args || null,
                        fnArgs = null;
                    descriptor.value = function (resolve, reject, request) {
                        var _this4 = this;

                        // authenticate and serve request
                        var onAuth = function onAuth() {
                            fnArgs = [resolve, reject, request];
                            fn.apply(undefined, _toConsumableArray(fnArgs));
                        };
                        if (claims) {
                            request.claims = claims;
                            var auth = new Auth();
                            auth.validate(request).then(onAuth).catch(function (err) {
                                if (_this4.env.isServer) {
                                    console.log('Failed to authenticate ' + request.url + '. (' + err + ')');
                                    request.response.send.error(401, err);
                                } else {
                                    console.log('Failed to authenticate ' + document.location.hash + '. (' + err + ')');
                                    var loginUrl = settings('sys.core:view.login');
                                    App.navigate(loginUrl, document.location.hash);
                                }
                            });
                        } else {
                            onAuth();
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
                    var err = new Error('Not Found: ' + req.url);
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
define('sys.core.bootwares.Router', [use('[Base]'), use('[IBootware]'), use(' | sys/core/libs/pathparser{.min}.js'), use('sys.core.comm.ServerRequest | sys.core.comm.ClientRequest'), use('sys.core.comm.Handler')], function (Base, IBootware, RouteManager, Request, Handler) {
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
                router = _this.env.isServer ? app : new RouteManager({}),
                fullUrl = '',
                mainModule = _this.settings(':main', 'sample'),
                routesKey = _this.env.isServer ? ':routes.server' : ':routes.client';

            // each route definition (both on server and client) is as:
            // { "root":"", url": "", "verb": "", "class": "", "func": ""}
            // root: root path under which given url to hook to
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
            routesOrder.unshift(_this.env.isServer ? 'app.' + mainModule : 'web.' + mainModule); // add main module by default, on top both in server and client side
            routesOrder.unshift(_this.assembly); // add sys.core (current module) by default, on top of main module, both in server and client side
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = routesOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var routesOf = _step.value;

                    if (_this.env.isDev) {
                        console.log('routes of: ' + routesOf);
                    }
                    routes = _this.settings(routesOf + routesKey, []);

                    var _loop = function _loop(route) {
                        if (route.url && route.class) {
                            fullUrl = (route.root || '') + route.url;
                            fullUrl = fullUrl.replace('//', '/');
                            if (_this.env.isServer) {
                                if (route.func && route.verb) {
                                    if (['get', 'post', 'put', 'delete'].indexOf(route.verb) === -1) {
                                        throw 'Unknown verb for: ' + route.url;
                                    }
                                    router[route.verb](fullUrl, function (req, res) {
                                        // router here is express app.
                                        try {
                                            var handler = new Handler(route.class, route.func),
                                                request = new Request(handler, route.verb, req, res);
                                            handler.handle(request);
                                        } catch (err) {
                                            console.log('Error handling ' + fullUrl + '. \n ' + err);
                                            res.status(500).end();
                                        }
                                    });
                                    if (_this.env.isDev) {
                                        console.log('  ' + route.verb + ': ' + fullUrl);
                                    }
                                } else {
                                    throw 'Invalid route definiton: ' + fullUrl + '#' + route.verb;
                                }
                            } else {
                                router.add(fullUrl, function () {
                                    // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                    var handler = new Handler(route.class, 'navigate'),
                                        request = new Request(handler, route.url, this);
                                    try {
                                        handler.handle(request);
                                    } catch (err) {
                                        console.log('Error handling ' + fullUrl + '. \n ' + err);
                                        throw err;
                                    }
                                });
                                if (_this.env.isDev) {
                                    console.log('  navigate: ' + fullUrl);
                                }
                            }
                        } else {
                            throw 'Invalid route definiton: ' + fullUrl;
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
        this.func('constructor', function (base, handler, url, args) {
            base(handler, url, args);
            var fullUrl = document.location.hash;
            if (fullUrl.indexOf('?') !== -1) {
                _this.query = _this.env.queryStringToObject(fullUrl.split('?')[1]); // query strings
            }
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
            _this.isRedirected = res ? res.redirected : false;
            _this.status = res ? res.status : err;
            _this.statusText = res ? res.statusText : err;
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

        this.func('handle', function (request) {
            var errorText = !_this.env.isServer ? 'Error handling: ' + request.url + '#' + request.verb : 'Error handling: ' + request.url + ' (%ERROR%)';
            include([use(_this.className)]).then(function (Handler) {
                var handler = new Handler();
                var handlerInfo = Reflector.get(handler);
                var funcInfo = handlerInfo.getMember(_this.funcName);
                _this.env.set('currentRequest', request);
                handler[_this.funcName](request).then(function (result) {
                    _this.env.reset('currentRequest');
                }).catch(function (err) {
                    _this.env.reset('currentRequest');
                    console.log(errorText.replace('%ERROR%', _this.errorText(err)));
                });
            }).catch(function (err) {
                console.log(errorText.replace('%ERROR%', _this.errorText(err)));
            });
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
        this.func('constructor', function (base, handler, url, args) {
            base();
            _this.handler = handler;
            _this.url = url;
            _this.args = args; // if url is -> abc/:name, .name will be available here
        });

        attr('readonly');
        this.prop('handler', null);

        attr('readonly');
        this.prop('url', '');

        attr('readonly');
        this.prop('args', null);

        attr('readonly');
        attr('once');
        this.prop('user', null);

        attr('readonly');
        attr('once');
        this.prop('claims', null);

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
        this.func('constructor', function (base, handler, verb, req, res) {
            base(handler, req.originalUrl, req.params);
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

        this.func('getLocale', function () {
            return _this.getHeader('userLocale');
        });
        this.func('getToken', function () {
            return _this.req.token || null;
        });
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
            json: function (_json) {
                function json(_x) {
                    return _json.apply(this, arguments);
                }

                json.toString = function () {
                    return _json.toString();
                };

                return json;
            }(function (json) {
                var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;

                if (config.env.isDev) {
                    console.log(json);
                }
                _this.res.status(status).json(json);
            }),
            data: function data(_data) {
                var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
                // data could be text, buffer, array, object
                if (config.env.isDev) {
                    console.log(json);
                }
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
                console.log(status + ': ' + message);
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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Service.js)
define('sys.core.comm.Service', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.comm.Service
     * @classdesc sys.core.comm.Service
     * @desc Service base.
     */
    return Class('sys.core.comm.Service', Base, function (attr) {});
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/Service.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/Automapper.js)
define('sys.core.data.Automapper', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.data.Automapper
     * @classdesc sys.core.data.Automapper
     * @desc Data entity to DTO/DBObject mapper and vice-versa.
     */
    return Class('sys.core.data.Automapper', Base, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base) {
            base();

            // set special variables
            var currentRequest = _this.env.currentRequest();
            _this.vars.$loginId = currentRequest && currentRequest.user ? currentRequest.user.loginId : '';
            _this.vars.$clientId = currentRequest && currentRequest.user ? currentRequest.user.clientId : '';
            _this.vars.$locale = _this.env.getLocale().name;
            _this.vars.$lcId = _this.env.getLocale().lcId;
        });

        // map can be defined as:
        // {
        //      entityPropertyName1: - OR objectPropertyName-Or-Path OR ArrayOfNames-Or-Paths, <-- '-', 'key1' OR 'path.to.key1' OR ['*', 'key1', 'key2', 'path.to.key1', '...']
        //      entityPropertyName2: { ... }
        // }
        // notes: 
        // 1. absence of any entityPropertyName OR emptyString will skip mapping that property
        // 2. - means same name as of entity property name
        // 3. In path name, special variables can be used to be replaced as per context
        //    client.$clientId.path.to.key <-- $clientId will be replaced by current user's clientId
        //    user.$loginId.path.to.key <-- $loginId will be replaced by current user's loginId
        //    $clientId.$loginId.path.to.key <-- $clientId and $loginId will be replaced by current user's clientId and loginId respectively
        //    i18n.$locale.path.to.key <-- $locale will be replaced by current user's locale's name
        //    i18n.$lcId.path.to.key <-- $lcId will be replaced by current user's locale's lcid
        attr('once');
        this.prop('config', {});

        attr('private');
        this.prop('vars', {});

        attr('private');
        this.func('resolveObjectProp', function (key) {
            var prop = '',
                cfg = _this.config[key];
            if (cfg) {
                if (cfg === '-') {
                    prop = key; // same
                } else {
                    if (cfg.indexOf('.') !== -1) {
                        // path exist
                        if (cfg.indexOf('$') !== -1) {
                            // special variables exists
                            for (var _var in _this.vars) {
                                if (_this.vars.hasOwnProperty(_var)) {
                                    cfg = cfg.replace(_var, _this.vars[_var]);
                                }
                            }
                        }
                    }
                    prop = cfg; // prop as is OR path as is OR path with resolved variables
                }
            }

            return prop;
        });

        this.func('to', function (toEntity, fromObject) {
            // iterate config to work on mapping
            for (var key in _this.config) {
                if (_this.config.hasOwnProperty(key)) {
                    // mapping info
                    var e = {
                        direction: 'o2e',
                        entity: {
                            prop: key,
                            value: null
                        },
                        object: {
                            prop: _this.resolveObjectProp(key),
                            value: null
                        }
                    };
                    e.entity.value = toEntity[e.entity.prop];
                    e.object.value = getNestedKeyValue(fromObject, e.object.prop, null);

                    if (e.object.prop) {
                        // mapping configuration exists
                        // mapping interception
                        // values can be updated by map function (unrestricted)
                        if (typeof _this.onMap === 'function') {
                            _this.onMap(e);
                        }

                        // mapping
                        setNestedKeyValue(toEntity, e.entity.prop, e.object.value);
                    }
                }
            }
        });
        this.func('from', function (fromEntity, toObject) {
            // iterate config to work on mapping
            for (var key in _this.config) {
                if (_this.config.hasOwnProperty(key)) {
                    // mapping info
                    var e = {
                        direction: 'e2o',
                        entity: {
                            prop: key,
                            value: null
                        },
                        object: {
                            prop: _this.resolveObjectProp(key),
                            value: null
                        }
                    };
                    e.entity.value = fromEntity[e.entity.prop];
                    e.object.value = getNestedKeyValue(toObject, e.object.prop, null);

                    if (e.object.prop) {
                        // mapping configuration exists
                        // mapping interception
                        // values can be updated by map function (unrestricted)
                        if (typeof _this.onMap === 'function') {
                            _this.onMap(e);
                        }

                        // mapping
                        setNestedKeyValue(toObject, e.object.prop, e.entity.value);
                    }
                }
            }
        });

        this.prop('onMap');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/Automapper.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/Repository.js)
define('sys.core.data.Repository', [use('[Base]'), use('[Automapper]')], function (Base, Automapper) {
    /**
     * @class sys.core.data.Repository
     * @classdesc sys.core.data.Repository
     * @desc Repository base.
     */
    return Class('sys.core.data.Repository', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, dbContext) {
            base();
            _this.dbContext = dbContext;
            _this.automapper = new Automapper();
        });

        attr('protected');
        this.prop('dbContext');

        attr('protected');
        this.prop('automapper');

        this.func('toEntity', function (Entity, dbObject) {
            var entity = new Entity();
            _this.automapper.to(entity, dbObject);
            return entity;
        });
        this.func('toEntityList', function (Entity, dbObjects) {
            var entities = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = dbObjects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var dbObject = _step.value;

                    entities.push(_this.toEntity(Entity, dbObject));
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

            return entities;
        });
        this.func('fromEntity', function (entity) {
            var object = {};
            _this.automapper.from(entity, object);
            return object;
        });
        this.func('fromEntityList', function (entities) {
            var dbObjects = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = entities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var entity = _step2.value;

                    dbObjects.push(_this.fromEntity(entity));
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

            return dbObjects;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/Repository.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/UnitOfWork.js)
define('sys.core.data.UnitOfWork', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.data.UnitOfWork
     * @classdesc sys.core.data.UnitOfWork
     * @desc UnitOfWork base.
     */
    return Class('sys.core.data.UnitOfWork', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, dbContext) {
            base();
            _this.dbContext = dbContext;
        });

        attr('protected');
        this.prop('dbContext');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/UnitOfWork.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/db/DbContext.js)
define('sys.core.db.DbContext', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.db.DbContext
     * @classdesc sys.core.db.DbContext
     * @desc DbContext for a database.
     */
    return Class('sys.core.db.DbContext', Base, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base, db) {
            base();
            _this.db = db;
        });

        attr('readonly');
        this.prop('db');

        attr('readonly');
        this.prop('tran', {
            begin: function begin() {
                _this.db.beginTran();
            },
            commit: function commit() {
                _this.db.commitTran();
            },
            rollback: function rollback() {
                _this.db.rollbackTran();
            }
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/db/DbContext.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/db/DiskDB.js)
define('sys.core.db.DiskDB', [use('[Base]'), use('fs-extra | '), use('diskdb | ')], function (Base, fs, diskdb) {
    /**
     * @class sys.core.db.DiskDB
     * @classdesc sys.core.db.DiskDB
     * @desc DiskDB access (for server as of now)
     */
    return Class('sys.core.db.DiskDB', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base, dbPath) {
            base();
            if (!_this.env.isServer) {
                throw 'DiskDB implementation is available for server usage only.';
            }

            // create db path, if does not exists
            if (!dbPath) {
                throw 'DiskDB path must be specified.';
            }
            _this.dbPath = dbPath;
            if (!fs.existsSync(dbPath)) {
                fs.ensureDirSync(dbPath);
            }
        });

        var _db = null;
        attr('private');
        this.prop('db', function () {
            if (_db === null) {
                _db = diskdb.connect(_this.dbPath);
            }
            return _db;
        });

        attr('private');
        this.func('collection', function (collectionName) {
            if (!_this.db[collectionName]) {
                _this.db.loadCollections([collectionName]);
            }
            return _this.db[collectionName];
        });

        attr('readonly');
        this.prop('dbPath', '');

        this.func('getCollection', function (collectionName) {
            return Object.freeze({
                db: _this.dbPath,
                collection: collectionName,
                insert: function insert(data) {
                    return _this.insert(collectionName, data);
                },
                update: function update(query, data, options) {
                    return _this.update(collectionName, query, data, options);
                },
                remove: function remove(query, options) {
                    return _this.remove(collectionName, query, options);
                },
                count: function count() {
                    return _this.count(collectionName);
                },
                get: function get(query) {
                    return _this.get(collectionName, query);
                },
                getAll: function getAll(query) {
                    return _this.getAll(collectionName, query);
                }
            });
        });
        this.func('insert', function (collectionName, data) {
            return _this.collection(collectionName).save(data);
        });
        this.func('update', function (collectionName, query, data, options) {
            return _this.collection(collectionName).update(query, data, options);
        });
        this.func('remove', function (collectionName, query, options) {
            var multi = true;
            if (options && typeof options.multi !== 'undefined') {
                multi = options.multi;
            }
            return _this.collection(collectionName).remove(query, multi);
        });
        this.func('count', function (collectionName) {
            return _this.collection(collectionName).count();
        });
        this.func('get', function (collectionName, query) {
            return _this.collection(collectionName).findOne(query);
        });
        this.func('getAll', function (collectionName, query) {
            return _this.collection(collectionName).find(query);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/db/DiskDB.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/domain/Controller.js)
define('sys.core.domain.Controller', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.domain.Controller
     * @classdesc sys.core.domain.Controller
     * @desc Controller base.
     */
    return Class('sys.core.domain.Controller', Base, function (attr) {
        this.func('toDTO', function (entity, Dto) {
            return entity.toDTO(entity, new Dto());
        });
        this.func('toDTOList', function (entities, Dto) {
            var dtos = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var entity = _step.value;

                    dtos.push(entity.toDTO(entity, new Dto()));
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

            return dtos;
        });
        this.func('fromDTO', function (Entity, dto) {
            var entity = new Entity();
            return entity.fromDTO(entity, dto);
        });
        this.func('fromDTOList', function (Entity, dtos) {
            var entities = [],
                entity = null;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = dtos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var dto = _step2.value;

                    entity = new Entity();
                    entities.push(entity.fromDTO(entity, dto));
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

            return entities;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/domain/Controller.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/domain/Entity.js)
define('sys.core.domain.Entity', [use('[Base]'), use('[Automapper]')], function (Base, Automapper) {
    /**
     * @class sys.core.domain.Entity
     * @classdesc sys.core.domain.Entity
     * @desc Entity base.
     */
    return Class('sys.core.domain.Entity', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base) {
            base();
            _this.automapper = new Automapper();
        });

        attr('protected');
        this.prop('automapper');

        this.func('toDTO', function (entity, dto) {
            _this.automapper.from(entity, dto);
            return dto;
        });
        this.func('fromDTO', function (entity, dto) {
            _this.automapper.to(entity, dto);
            return entity;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/domain/Entity.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/ClaimsChecker.js)
define('sys.core.security.ClaimsChecker', function () {
    /**
     * @class sys.core.security.ClaimsChecker
     * @classdesc sys.core.security.ClaimsChecker
     * @desc Check claims.
     */
    return Class('sys.core.security.ClaimsChecker', function (attr) {
        attr('singleton');
        this.func('constructor', function () {});

        this.func('check', function (requestedClaims, availableAccess) {
            var success = false;
            if (requestedClaims) {
                if (requestedClaims.length === 1 && requestedClaims[0] === 'auth') {
                    // this is ok, nothing else needs to be done
                    success = true;
                } else {
                    var orClaims = null,
                        hasClaim = function hasClaim(claim) {
                        return availableAccess && availableAccess.indexOf(claim) !== -1;
                    };
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = requestedClaims[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var claim = _step.value;

                            if (claim === 'auth') {
                                // ignore, since it is added along with other claims
                                continue;
                            }
                            if (claim.indexOf('||') !== -1) {
                                orClaims = claim.split('||');
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = orClaims[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var orClaim = _step2.value;

                                        success = hasClaim(orClaim);
                                        if (success) {
                                            break;
                                        } // since at least one OR claim found
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
                            } else {
                                success = hasClaim(claim);
                                if (!success) {
                                    break;
                                } // since at least one AND claim not found
                            }
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
            } else {
                success = true;
            }
            return success;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/ClaimsChecker.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/CredentialsCreator.js)
define('sys.core.security.CredentialsCreator', [use('[Base]'), use('[User]'), use('[Credentials]')], function (Base, User, Credentials) {
    /**
     * @class sys.core.security.CredentialsCreator
     * @classdesc sys.core.security.CredentialsCreator
     * @desc Creates credentials object.
     */
    return Class('sys.core.security.CredentialsCreator', Base, function (attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', function (base) {
            base();
        });

        this.func('create', function (loginId, pwd) {
            var clientId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            return new Credentials(loginId, pwd, clientId);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/CredentialsCreator.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/CredentialsValidator.js)
define('sys.core.security.CredentialsValidator', [use('[Base]'), use('[User]')], function (Base, User) {
    /**
     * @class sys.core.security.CredentialsValidator
     * @classdesc sys.core.security.CredentialsValidator
     * @desc Validates credentials and returns validated user.
     */
    return Class('sys.core.security.CredentialsValidator', Base, function (attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', function (base) {
            base();
        });

        attr('async');
        this.func('validate', function (resolve, reject, credentials) {
            var validatedUser = new User(credentials.loginId, '(Dummy)', [], [], credentials.clientId);
            resolve(validatedUser);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/CredentialsValidator.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/Crypt.js)
define('sys.core.security.Crypt', [use('[Base]'), use('sys/core/libs/aes{.min}.js'), use('sys/core/libs/md5{.min}.js')], function (Base) {
    /**
     * @class sys.core.security.Crypt
     * @classdesc sys.core.security.Crypt
     * @desc Crypt functions.
     */
    return Class('sys.core.security.Crypt', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('singleton');
        this.func('constructor', function (base) {
            base();
            _this.secretKey = _this.settings('crypt.secretKey', 'adfdef1d-ce1a-470d-a652-f466292acf85');
        });

        this.func('encrypt', function (plainText) {
            var secretKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return CryptoJS.AES.encrypt(plainText, secretKey || _this.secretKey).toString();
        });
        this.func('decrypt', function (encryptedText) {
            var secretKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            return CryptoJS.AES.decrypt(encryptedText, secretKey || _this.secretKey).toString(CryptoJS.enc.Utf8);
        });
        this.func('hash', function (text) {
            return CryptoJS.MD5(text).toString();
        });

        attr('private');
        this.prop('secretKey', '');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/Crypt.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Adapter.js)
define('sys.core.ui.Adapter', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.ui.Adapter
     * @classdesc sys.core.ui.Adapter
     * @desc Adapter base class to define custom adapters for rivets.
     */
    return Class('sys.core.ui.Adapter', Base, function (attr) {
        this.prop('adapterName', '');
        this.func('observe', this.noop);
        this.func('unobserve', this.noop);
        this.func('get', this.noop);
        this.func('set', this.noop);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Adapter.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Binder.js)
define('sys.core.ui.Binder', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.ui.Binder
     * @classdesc sys.core.ui.Binder
     * @desc Binder base class to define custom binders for rivets.
     */
    return Class('sys.core.ui.Binder', Base, function (attr) {
        this.prop('binderName', '');
        this.func('bind', this.noop);
        this.func('unbind', this.noop);
        this.func('routine', this.noop);
        this.func('getValue', this.noop);
        this.prop('isTwoWay', false);
        this.prop('publishes', false);
        this.prop('block', false);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Binder.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Component.js)
define('sys.core.ui.Component', [use('[Base]'), use('sys.core.ui.ComponentTypes')], function (Base, ComponentTypes) {
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
            _this.data.assets = {}; // special data name, where all assets are loaded
        });

        attr('protected');
        attr('sealed');
        this.func('init', function () {
            return new Promise(function (resolve, reject) {
                var defineHost = function defineHost() {
                    var $host = null,
                        elClass = '';
                    switch (_this.type) {
                        case ComponentTypes.Shell:
                            $host = document.querySelector(_this.settings('view.$stage', '#stage'));
                            if (!$host) {
                                var $stage = document.createElement('div');
                                $stage.setAttribute('id', 'stage');
                                document.body.append($stage);
                                $host = $stage;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            if (elClass.indexOf('ag-stage') === -1) {
                                elClass = 'ag-stage ' + elClass;
                            }
                            $host.setAttribute('class', elClass.trim());

                            _this._.pr.$host = $host;
                            break;
                        case ComponentTypes.View:
                            $host = _this.parent._.pr.$el.querySelector(_this.settings('view.$container', '#container'));
                            if (!$host) {
                                var $container = document.createElement('div');
                                $container.setAttribute('id', 'container');
                                _this.parent._.pr.$el.append($container);
                                $host = $container;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            if (elClass.indexOf('ag-container') === -1) {
                                elClass = 'ag-container ' + elClass;
                            }
                            $host.setAttribute('class', elClass.trim());

                            _this._.pr.$host = $host;
                            break;
                        case ComponentTypes.Partial:
                            // already defined where instantiated
                            break;
                    }
                };
                var loadHtml = function loadHtml() {
                    return new Promise(function (resolve, reject) {
                        var onLoadHtml = function onLoadHtml(html) {
                            // process html
                            // 1. replace all {.min}.<> with .min.<> or .<> as per debug mode
                            // 2. replace all ~/<> paths with this component's root url + <>
                            // 3. replace all @:<> with shell.<> || view.<> || partials.<partial.id>.<>
                            html = replaceAll(html, '{.min}', _this.env.isProd ? '.min' : '');
                            html = replaceAll(html, '~/', _this.url());
                            switch (_this.type) {
                                case ComponentTypes.Shell:
                                    html = replaceAll(html, '@:', 'shell.');
                                    break;
                                case ComponentTypes.View:
                                    html = replaceAll(html, '@:', 'view.');
                                    break;
                                case ComponentTypes.Partial:
                                    html = replaceAll(html, '@:', 'partials.' + _this._.id + '.');
                                    break;
                            }

                            // build element
                            var template = document.createElement('template');
                            template.innerHTML = html;
                            _this._.pr.$el = template.content.firstElementChild;
                            _this._.pr.$el.setAttribute('id', _this._.id);

                            // add class
                            var elClass = _this._.pr.$el.getAttribute('class') || '',
                                elClassName = '';
                            switch (_this.type) {
                                case ComponentTypes.Shell:
                                    elClassName = 'shell';break;
                                case ComponentTypes.View:
                                    elClassName = 'view';break;
                                case ComponentTypes.Partial:
                                    elClassName = 'partial';break;
                            }
                            if (elClass.indexOf('ag-' + elClassName) === -1) {
                                elClass = 'ag-' + elClassName + ' ' + elClass;
                            }
                            _this._.pr.$el.setAttribute('class', elClass.trim());

                            // done
                            resolve();
                        };
                        if (_this.template) {
                            onLoadHtml(_this.template);
                        } else {
                            var template = _this.url('index.html');
                            include([template]).then(onLoadHtml).catch(reject);
                        }
                    });
                };
                var initPartials = function initPartials() {
                    return new Promise(function (_resolve, _reject) {
                        // find partials
                        // a partial is defined in html as:
                        //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                        var $partials = _this._.pr.$el.querySelectorAll('[ag-partial]'),
                            partials = [],
                            partialClassParams = [],
                            partialObjects = [],
                            className = '',
                            args = null,
                            tagName = '';
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = $partials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var $partial = _step.value;

                                className = use($partial.getAttribute('ag-partial'));
                                args = $partial.getAttribute('ag-args');
                                tagName = $partial.getAttribute('ag-name');
                                args = args ? _this.env.queryStringToObject(args) : null;
                                partials.push(className);
                                partialClassParams.push({ $host: $partial, args: args, tagName: tagName });
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
                                    pa = null,
                                    po = null;
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = PartialClasses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var PartialClass = _step2.value;

                                        pa = partialClassParams[i];
                                        po = new PartialClass(_this, pa.args);
                                        po._.pr.$host = pa.$host;
                                        po._.pr.tagName = pa.tagName || po._.id;
                                        partialObjects.push(po);
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
                                    partialObject._.pr.init().then(function () {
                                        if (_this.partials[partialObject._.pr.tagName]) {
                                            throw 'partial names must be unique. ' + partialObject._.pr.tagName;
                                        }
                                        _this.partials[partialObject._.pr.tagName] = partialObject;
                                        __resolve();
                                    }).catch(__reject);
                                }).then(_resolve).catch(_reject);
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
                        var deps = _this._.pr.$el.getAttribute('ag-deps');
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
                                                    _this.styles += '\n/* next */\n' + thisStyle;
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
                var loadAssets = function loadAssets() {
                    return new Promise(function (resolve, reject) {
                        // assets are non-nested resource bundle JSON files
                        // { 
                        //      "key1": "stringValue",
                        //      "key2": number / boolean / date / ...
                        //      "key3": "/url/of/a/file" <-- must start with "/" to identify it as a relative url
                        // }
                        //
                        // assets can be defined in a UI component as:
                        // this.asset('myAsset1', 'sys/core/assets/myAsset1.json');
                        // 
                        // this will be available after init as:
                        // this.data.assets.myAsset1 object having 
                        // {
                        //      key1: "stringValue",
                        //      key2: ...
                        //      key3: "sys/core/assets/<lcId>/url/of/a/file"    
                        // }

                        // files to load
                        var assetNames = [],
                            assets = [];
                        for (var assetName in _assets) {
                            if (_this.asset.hasOwnProperty(assetName)) {
                                assetNames.push(assetName);
                                assets.push(_this.asset[assetName]);
                            }
                        }

                        // load files
                        include(assets, true).then(function () {
                            var objects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

                            var i = 0,
                                assetName = '',
                                assetValue = '';
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = objects[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var assetObject = _step5.value;

                                    assetName = assetNames[i];
                                    _this.data.assets[assetName] = assetObject;
                                    for (var assetKey in assetObject) {
                                        if (assetObject.hasOwnProperty(assetKey)) {
                                            assetValue = assetObject[assetKey];
                                            if (assetValue.substr(0, 1) === '/') {
                                                // this is a url
                                                assetObject[assetKey] = _this.url(assetValue); // make it relative url
                                            }
                                        }
                                    }
                                    i++; // next asset
                                }
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            resolve();
                        }).catch(reject);
                    });
                };

                // init
                _this._.pr.beforeInit().then(function () {
                    loadAssets().then(function () {
                        loadHtml().then(function () {
                            defineHost();
                            loadDeps().then(function () {
                                initPartials().then(function () {
                                    _this._.pr.afterInit().then(resolve).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            });
        });

        attr('protected');
        this.prop('$el', null);

        attr('protected');
        this.prop('$host', null);

        attr('protected');
        this.prop('$style', null);

        attr('protected');
        this.prop('styles', '');

        attr('protected');
        this.prop('template', '');

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

        attr('readonly');
        this.prop('partials', {});

        attr('readonly');
        this.prop('type', -1);

        attr('readonly');
        this.prop('parent', null);

        attr('readonly');
        attr('once');
        this.prop('args', null);

        var _root = '';
        attr('protected');
        attr('sealed');
        this.func('url', function () {
            var relativeUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            if (!_root) {
                _root = use(_this._.name, 'server'); // e.g., web.sample.shells.Full --> /web/modules/sample/members/shell/Full.js
                _root = _root.replace('modules/', '').replace('.js', '') + '/'; // /web/sample/members/shell/Full/
            }
            if (relativeUrl.substr(0, 1) === '/') {
                relativeUrl = relativeUrl.substr(1);
            }

            // locale handling
            if (relativeUrl.indexOf('/assets/') !== -1) {
                relativeUrl = relativeUrl.replace('/assets/', '/assets/' + _this.env.getLocate().name + '/');
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

        attr('protected');
        attr('sealed');
        this.func('pub', function (topic) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var handlers = _this.env.get('handlers', null);
            if (!handlers) {
                _this.env.get('handlers', {});
            }
            var topicHandlers = handlers[topic] || [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = topicHandlers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var handler = _step6.value;

                    handler.apply(undefined, args);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        });

        attr('protected');
        attr('sealed');
        this.func('sub', function (topic, handler) {
            var handlers = _this.env.get('handlers', null);
            if (!handlers) {
                _this.env.set('handlers', {});
            }
            handlers[topic] = handlers[topic] || [];
            handlers[topic].push(handler);
        });

        attr('protected');
        attr('sealed');
        this.func('data', function (name, value) {
            if (typeof value === 'function') {
                throw 'data value cannot be a function.';
            }
            _this._.bindable = _this._.bindable || {};
            if (typeof _this._.bindable[name] !== 'undefined') {
                throw name + ' already defined as data/handler.';
            }
            _this._.bindable[name] = value;
            Object.defineProperty(_this.data, name, {
                get: function get() {
                    return _this._.bindable[name];
                },
                set: function set(value) {
                    _this._.bindable[name] = value;
                }
            });
        });

        attr('sealed');
        this.func('setData', function (data) {
            if (data) {
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        if (typeof _this.data[name] === 'undefined') {
                            _this.data(name, data[name]);
                        } else {
                            _this.data[name] = data[name];
                        }
                    }
                }
            }
        });

        attr('sealed');
        this.func('getData', function () {
            var data = {};
            for (var name in _this._.bindable) {
                if (_this._.bindable.hasOwnProperty(name) && typeof _this.data.name !== 'undefined') {
                    data[name] = _this.data[name];
                }
            }
            return data;
        });

        attr('protected');
        attr('sealed');
        this.func('handler', function (name, fn) {
            if (typeof fn !== 'function') {
                throw 'handler value must be a function.';
            }
            var wrappedFn = function wrappedFn(e) {
                fn(e.currentTarget, e);
            };
            _this._.bindable = _this._.bindable || {};
            if (typeof _this._.bindable[name] !== 'undefined') {
                throw name + ' already defined as data/handler.';
            }
            _this._.bindable[name] = wrappedFn;
            Object.defineProperty(_this.handler, name, {
                value: wrappedFn
            });
        });

        var _assets = {};
        attr('protected');
        this.func('asset', function (name, bundleUrl) {
            if (typeof _this.asset[name] !== 'undefined') {
                throw name + ' already defined.';
            }
            _this.asset[name] = _this.url(bundleUrl); // actual bundle object will be loaded at this.data.assets.<name> after init is executed
            _assets[name] = _this.asset[name];
        });

        this._.cfas = function (asyncFuncName) {
            for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                args[_key2 - 2] = arguments[_key2];
            }

            var isSkipPartials = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return new Promise(function (resolve, reject) {
                var _parent$_;

                var callOnPartials = function callOnPartials(_obj) {
                    return new Promise(function (_resolve, _reject) {
                        var allPartials = [];
                        for (var po in _obj.partials) {
                            if (_obj.partials.hasOwnProperty(po)) {
                                allPartials.push(_obj.partials[po]);
                            }
                        }
                        if (allPartials.length > 0) {
                            forAsync(allPartials, function (__resolve, __reject, partial) {
                                var _partial$_;

                                (_partial$_ = partial._).cfas.apply(_partial$_, [asyncFuncName].concat(args)).then(__resolve).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // cumulative function call (async)
                switch (_this.type) {
                    case ComponentTypes.Shell:
                        if (typeof _this._.pr[asyncFuncName] === 'function') {
                            var _$pr;

                            (_$pr = _this._.pr)[asyncFuncName].apply(_$pr, args).then(function () {
                                if (!isSkipPartials) {
                                    callOnPartials(_this).then(resolve).catch(reject);
                                } else {
                                    resolve();
                                }
                            }).catch(reject);
                        } else {
                            resolve();
                        }
                        break;
                    case ComponentTypes.View:
                        (_parent$_ = _this.parent._).cfas.apply(_parent$_, [asyncFuncName, isSkipPartials].concat(args)).then(function () {
                            if (typeof _this._.pr[asyncFuncName] === 'function') {
                                var _$pr2;

                                (_$pr2 = _this._.pr)[asyncFuncName].apply(_$pr2, args).then(function () {
                                    if (!isSkipPartials) {
                                        callOnPartials(_this).then(resolve).catch(reject);
                                    } else {
                                        resolve();
                                    }
                                }).catch(reject);
                            } else {
                                resolve();
                            }
                        }).catch(reject);
                        break;
                    case ComponentTypes.Partial:
                        if (typeof _this._.pr[asyncFuncName] === 'function') {
                            var _$pr3;

                            (_$pr3 = _this._.pr)[asyncFuncName].apply(_$pr3, args).then(function () {
                                callOnPartials(_this).then(resolve).catch(reject);
                            }).catch(reject);
                        } else {
                            resolve();
                        }
                        break;
                }
            });
        };
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Component.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/ComponentTypes.js)
define('sys.core.ui.ComponentTypes', function () {
    /**
     * @class sys.core.ui.ComponentTypes
     * @classdesc sys.core.ui.ComponentTypes
     * @desc Component types.
     */
    return Enum('sys.core.ui.ComponentTypes', {
        Shell: 0,
        View: 1,
        Partial: 2
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/ComponentTypes.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Formatter.js)
define('sys.core.ui.Formatter', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.ui.Formatter
     * @classdesc sys.core.ui.Formatter
     * @desc Formatter base class to define custom formatters for rivets.
     */
    return Class('sys.core.ui.Formatter', Base, function (attr) {
        this.prop('formatterName', '');
        this.func('read', this.noop);
        this.func('publish', this.noop);
        this.prop('isTwoWay', false);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Formatter.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Partial.js)
define('sys.core.ui.Partial', [use('sys.core.ui.Component'), use('sys.core.ui.ComponentTypes')], function (Component, ComponentTypes) {
    /**
     * @class sys.core.ui.Partial
     * @classdesc sys.core.ui.Partial
     * @desc Partial base class.
     */
    return Class('sys.core.ui.Partial', Component, function (attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', function (base, parent, args) {
            base(ComponentTypes.Partial, parent, args);
        });

        attr('protected');
        attr('once');
        this.prop('tagName', '');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Partial.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Shell.js)
define('sys.core.ui.Shell', [use('sys.core.ui.Component'), use('sys.core.ui.ComponentTypes')], function (Component, ComponentTypes) {
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
            base(ComponentTypes.Shell, null, args);
            _this.child = view;
        });

        attr('readonly');
        this.prop('child', null);
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
        this.func('in', function ($new) {
            var $current = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if ($current) {
                $current.style.display = 'none';
            }
            $new.style.display = 'block';
        });
        this.func('out', function ($current) {
            var $new = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            $current.style.display = 'none';
            if ($new) {
                $new.style.display = 'block';
            }
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/Transition.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/View.js)
define('sys.core.ui.View', [use('[Base]'), use('sys.core.ui.Component'), use('sys.core.ui.ComponentTypes'), use('sys.core.ui.Transition'), use('sys.core.bootwares.client.DataBinder')], function (Base, Component, ComponentTypes, DefaultTransition, DataBinder) {
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
            var shell = new Shell(null, _this);
            base(ComponentTypes.View, shell, null);
            if (Transition) {
                _this.transition = new Transition();
            } else {
                _this.transition = new DefaultTransition();
            }
        });

        attr('protected');
        this.prop('request', null);

        attr('async');
        this.func('navigate', function (resolve, reject, request) {
            _this.request = request;
            _this.args = request.args;
            _this.stage().then(function () {
                _this.current = _this._.pu; // store public reference
                resolve(_this.current);
            }).catch(function (err) {
                console.log('Failed to navigate to ' + request.url + '. (' + (err || '') + ');');
                reject(err);
            });
        });

        attr('private');
        attr('async');
        this.func('stage', function (resolve, reject) {
            if (_this.current !== _this) {
                // reset handlers
                _this.env.set('handlers', {});

                var last = _this.current,
                    current = _this;
                // sequence
                // (partials are processed along with shell/view)
                // this init
                // EITHER (if last view exists)
                //  last beforeHide
                //  this beforeShow
                //  this mount
                //  this bind
                //  set direction
                //  transtion this in and last out
                //  last afterHide
                //  last unbind
                //  last unmount
                //  this afterShow
                // OR (when last view does not exists)
                //  this beforeShow
                //  this mount
                //  this bind
                //  set direction
                //  transtion this in
                //  this afterShow
                // this focus
                _this.parent._.pr.init().then(function () {
                    _this._.pr.init().then(function () {
                        if (last) {
                            last._.cfas('beforeHide').then(function () {
                                current._.cfas('beforeShow').then(function () {
                                    current._.pr.mount();
                                    current._.pr.bind();
                                    _this.setDirection();
                                    _this.transition.in(current._.pr.$el, last._.pr.$el);
                                    last._.cfas('afterHide').then(function () {
                                        last._.pr.unbind();
                                        last._.pr.unmount();
                                        current._.cfas('afterShow').then(function () {
                                            current._.pr.focus();
                                            resolve();
                                        }).catch(reject);
                                    }).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                        } else {
                            current._.cfas('beforeShow').then(function () {
                                current._.pr.mount();
                                current._.pr.bind();
                                _this.setDirection();
                                _this.transition.in(current._.pr.$el);
                                current._.cfas('afterShow').then(function () {
                                    current._.pr.focus();
                                    resolve();
                                }).catch(reject);
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
        this.func('setDirection', function () {
            // set/reset rtl
            var currentRTL = document.body.getAttribute('dir');
            if (_this.env.getLocale().rtl) {
                if (currentRTL !== 'rtl') {
                    document.body.setAttribute('dir', 'rtl');
                }
            } else {
                if (currentRTL === 'rtl') {
                    document.body.setAttribute('dir', '');
                }
            }
        });

        attr('protected');
        attr('sealed');
        this.func('mount', function () {
            // mount styles
            var mountStyles = function mountStyles(obj) {
                if (obj._.pr.styles) {
                    obj._.pr.$style = document.createElement('style');
                    obj._.pr.$style.setAttribute('scoped', '');
                    obj._.pr.$style.appendChild(document.createTextNode(obj._.pr.styles));
                    obj._.pr.$el.prepend(obj._.pr.$style);
                }
            };

            // mount partials
            var mountPartial = function mountPartial(partial) {
                partial._.pr.$host.append(partial._.pr.$el);
                mountStyles(partial);
                mountPartials(partial.partials);
            };
            var mountPartials = function mountPartials(partials) {
                var partial = null;
                for (var po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];
                        mountPartial(partial);
                    }
                }
            };

            // mount shell to stage
            _this.parent._.pr.$host.append(_this.parent._.pr.$el);
            mountStyles(_this.parent);
            mountPartials(_this.parent.partials);

            // mount view to shell container
            _this._.pr.$host.append(_this._.pr.$el);
            mountStyles(_this);
            mountPartials(_this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', function () {
            // unmount styles
            var unmountStyles = function unmountStyles(obj) {
                if (obj._.pr.$style) {
                    obj._.pr.$style.remove();
                }
            };

            // unmount partials
            var unmountPartial = function unmountPartial(partial) {
                unmountStyles(partial);
                partial._.pr.$el.remove();
                unmountPartials(partial.partials);
            };
            var unmountPartials = function unmountPartials(partials) {
                var partial = null;
                for (var po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];
                        unmountPartial(partial);
                    }
                }
            };

            // unmount view from shell container
            unmountStyles(_this);
            _this._.pr.$el.remove();
            unmountPartials(_this.partials);

            // unmount shell from stage
            unmountStyles(_this.parent);
            _this.parent._.pr.$el.remove();
            unmountPartials(_this.parent.partials);
        });

        var _bindedView = null;
        attr('protected');
        attr('sealed');
        this.func('bind', function () {
            if (!_bindedView) {
                var getPartialBindings = function getPartialBindings(target, _obj) {
                    var partial = null;
                    for (var po in _obj.partials) {
                        if (_obj.partials.hasOwnProperty(po)) {
                            partial = _obj.partials[po];
                            target[partial._.id] = partial._.bindable;
                            getPartialBindings(target, partial);
                        }
                    }
                };

                // get bindings
                var obj = {
                    partials: {},
                    shell: _this.parent._.bindable,
                    view: _this._.bindable
                };
                getPartialBindings(obj.partials, _this.parent);
                getPartialBindings(obj.partials, _this);

                // bind
                var binder = new DataBinder(); // its singleton, so no issue
                _bindedView = binder.bind(_this.parent._.pr.$el, obj);
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

        attr('protected');
        attr('sealed');
        this.func('focus', function () {
            var $focus = _this._.pr.$el.querySelector('[ag-focus');
            if ($focus) {
                $focus.focus();
            }
        });

        attr('protected');
        this.func('redirect', function () {
            if (_this.request.query && _this.request.query.returnUrl) {
                App.navigate(_this.request.query.returnUrl, true);
            }
        });

        this.data('title', '');
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
                var loadBinders = function loadBinders() {
                    return new Promise(function (_resolve, _reject) {
                        var items = _this.settings('rivets.binders', null);
                        if (items) {
                            forAsync(items, function (__resolve, __reject, item) {
                                include([use(item)]).then(function (Binder) {
                                    // create
                                    var obj = new Binder();

                                    // validate
                                    if (!obj.binderName) {
                                        throw 'Binder name is not defined. (' + obj._.name + ')';
                                    }

                                    // define binder
                                    if (!rivets.binders[obj.binderName]) {
                                        if (!obj.isTwoWay) {
                                            // one-way binder
                                            rivets.binders[obj.binderName] = obj.routine;
                                        } else {
                                            // two-way binder
                                            rivets.binders[obj.binderName] = {
                                                bind: obj.bind,
                                                unbind: obj.unbind,
                                                routine: obj.routine,
                                                getValue: obj.getValue,
                                                publishes: obj.publishes,
                                                block: obj.block
                                            };
                                        }
                                    }

                                    // done
                                    __resolve();
                                }).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // custom formatters 
                var loadFormatters = function loadFormatters() {
                    return new Promise(function (_resolve, _reject) {
                        var items = _this.settings('rivets.formatters', null);
                        if (items) {
                            forAsync(items, function (__resolve, __reject, item) {
                                include([use(item)]).then(function (Formatter) {
                                    // create
                                    var obj = new Formatter();

                                    // validate
                                    if (!obj.formatterName) {
                                        throw 'Formatter name is not defined. (' + obj._.name + ')';
                                    }

                                    // define formatter
                                    if (!rivets.formatters[obj.formatterName]) {
                                        if (!obj.isTwoWay) {
                                            // one-way formatter
                                            rivets.formatters[obj.formatterName] = obj.read;
                                        } else {
                                            // two-way formatter
                                            rivets.formatters[obj.formatterName] = {
                                                read: obj.read,
                                                publish: obj.publish
                                            };
                                        }
                                    }

                                    // done
                                    __resolve();
                                }).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // custom adapters
                var loadAdapters = function loadAdapters() {
                    return new Promise(function (_resolve, _reject) {
                        var items = _this.settings('rivets.adapters', null);
                        if (items) {
                            forAsync(items, function (__resolve, __reject, item) {
                                include([use(item)]).then(function (Adapter) {
                                    // create
                                    var obj = new Adapter();

                                    // validate
                                    if (!obj.adapterName) {
                                        throw 'Adapter name is not defined. (' + obj._.name + ')';
                                    }

                                    // define adapter
                                    if (!rivets.adapters[obj.adapterName]) {
                                        rivets.adapters[obj.adapterName] = {
                                            observe: obj.observe,
                                            unobserve: obj.unobserve,
                                            get: obj.get,
                                            set: obj.set
                                        };
                                    }

                                    // done
                                    __resolve();
                                }).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // process
                loadBinders().then(function () {
                    loadFormatters().then(function () {
                        loadAdapters().then(resolve).catch(reject);
                    }).catch(reject);
                }).catch(reject);
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
                                if (_this.env.isDev) {
                                    console.log('middleware: ' + item.name + '.' + item.func + '(' + item.args + ')');
                                }
                            } else {
                                app.use(mw.apply(undefined, _toConsumableArray(item.args)));
                                if (_this.env.isDev) {
                                    console.log('middleware: ' + item.name + '(' + item.args + ')');
                                }
                            }
                        } else {
                            if (item.func) {
                                app.use(mw[item.func]());
                                if (_this.env.isDev) {
                                    console.log('middleware: ' + item.name + '.' + item.func + '()');
                                }
                            } else {
                                app.use(mw());
                                if (_this.env.isDev) {
                                    console.log('middleware: ' + item.name + '()');
                                }
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
            var fi = _this.settings('static.favIcon', '');
            if (fi) {
                app.use(favicon(use(fi)));
                if (_this.env.isDev) {
                    console.log('favIcon: ' + fi);
                }
            }

            // configure static content serving
            var age = _this.settings('static.caching.age', 0),
                mainModule = _this.settings(':main', 'sample'),
                staticFolders = _this.settings(':static', []);
            staticFolders.unshift('web.' + mainModule); // add main module by default, on top both in server and client side
            staticFolders.unshift(_this.assembly); // add sys.core (this module) on top as first default item
            if (_this.settings('static.caching.enabled') && age !== 0) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = staticFolders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var staticFolder = _step.value;

                        staticFolder = use(staticFolder).replace('members/', '').replace('.js', '') + 'static/';
                        app.use('/', express.static(staticFolder, { maxAge: age }));
                        if (_this.env.isDev) {
                            console.log('static: / = ' + staticFolder);
                        }
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

                app.use('/web', express.static(use('./web/modules/'), { maxAge: age }));
                if (_this.env.isDev) {
                    console.log('static: /web = ' + use('./web/modules/'));
                }
                app.use('/sys', express.static(use('./sys/modules/'), { maxAge: age }));
                if (_this.env.isDev) {
                    console.log('static: /sys = ' + use('./sys/modules/'));
                }
            } else {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = staticFolders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _staticFolder = _step2.value;

                        _staticFolder = use(_staticFolder).replace('members/', '').replace('.js', '') + 'static/';
                        app.use('/', express.static(_staticFolder));
                        if (_this.env.isDev) {
                            console.log('static: / = ' + _staticFolder);
                        }
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

                app.use('/web', express.static(use('./web/modules/')));
                if (_this.env.isDev) {
                    console.log('static: /web = ' + use('./web/modules/'));
                }
                app.use('/sys', express.static(use('./sys/modules/')));
                if (_this.env.isDev) {
                    console.log('static: /sys = ' + use('./sys/modules/'));
                }
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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/client/Auth.js)
define('sys.core.security.client.Auth', [use('[Base]'), use('[User]'), use('[ClaimsChecker]')], function (Base, User, ClaimsChecker) {
    /**
     * @class sys.core.security.client.Auth
     * @classdesc sys.core.security.client.Auth
     * @desc App authentication and authorization (client side)
     */
    return Class('sys.core.security.client.Auth', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('singleton');
        this.func('constructor', function (base) {
            base();
        });

        attr('async');
        this.func('validate', function (resolve, reject, request) {
            var token = _this.token,
                user = _this.user;
            if (token) {
                if (user) {
                    var claimsChecker = new ClaimsChecker();
                    if (claimsChecker.check(request.claims, user.access)) {
                        request.user = user;
                        resolve();
                    } else {
                        reject('Unauthorized.');
                    }
                } else {
                    reject('Unauthorized user.');
                }
            } else {
                reject('Authentication token is not available.');
            }
        });

        attr('service', '/auth', {
            method: 'POST',
            requestDataType: 'application/json',
            responseDataType: 'json',
            pre: function pre(args) {
                args.body = { credentials: args.body };
            }
        });
        this.func('login', function (service, resolve, reject, credentials) {
            service({ credentials: credentials }).then(function (response) {
                if (response.isError) {
                    reject(response.error);
                } else {
                    var loginResult = response.data;
                    _this.token = loginResult.token;
                    _this.user = loginResult.user;
                    resolve(_this.user);
                }
            }).catch(reject);
        });

        this.func('logout', function () {
            _this.token = null;
            _this.user = null;
        });

        this.prop('isLoggedIn', function () {
            return _this.token && _this.user ? true : false;
        });
        this.func('getToken', function () {
            return _this.token;
        });
        this.func('getTokenHeader', function () {
            return { Authorization: 'Bearer ' + _this.token };
        });
        this.func('getUser', function () {
            return _this.user;
        });

        attr('private');
        attr('session');
        this.prop('token', null);

        attr('private');
        attr('session');
        this.prop('user', null);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/client/Auth.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/dto/AuthInfo.js)
define('sys.core.security.dto.AuthInfo', function () {
    /**
     * @class sys.core.security.dto.AuthInfo
     * @classdesc sys.core.security.dto.AuthInfo
     * @desc User auth information.
     */
    return Structure('sys.core.security.dto.AuthInfo', function (token, user) {
        this.token = token;
        this.user = user;
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/dto/AuthInfo.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/dto/Credentials.js)
define('sys.core.security.dto.Credentials', function () {
    /**
     * @class sys.core.security.dto.Credentials
     * @classdesc sys.core.security.dto.Credentials
     * @desc Login credentials.
     */
    return Structure('sys.core.security.dto.Credentials', function (loginId, pwdHash) {
        var clientId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        this.clientId = clientId;
        this.loginId = loginId;
        this.pwdHash = pwdHash;
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/dto/Credentials.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/dto/User.js)
define('sys.core.security.dto.User', function () {
    /**
     * @class sys.core.security.dto.User
     * @classdesc sys.core.security.dto.User
     * @desc User information.
     */
    return Structure('sys.core.security.dto.User', function (loginId, name, roles, access) {
        var clientId = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

        this.clientId = clientId;
        this.loginId = loginId;
        this.name = name;
        this.roles = roles;
        this.access = access;
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/dto/User.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/server/Auth.js)
define('sys.core.security.server.Auth', [use('[Base]'), use('[User]'), use('[ClaimsChecker]'), use('[Credentials]'), use('[CredentialsValidator]'), use('sys.core.security.server.JwtToken'), use('sys.core.security.dto.AuthInfo')], function (Base, User, ClaimsChecker, Credentials, CredentialsValidator, Jwt, AuthInfo) {
    /**
     * @class sys.core.security.server.Auth
     * @classdesc sys.core.security.server.Auth
     * @desc App authentication and authorization (server side)
     */
    return Class('sys.core.security.server.Auth', Base, function (attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', function (base) {
            base();
        });

        attr('async');
        this.func('validate', function (resolve, reject, request) {
            var token = request.getToken();
            if (token) {
                var _jwt = new Jwt();
                _jwt.verify(token).then(function (user) {
                    if (user) {
                        var claimsChecker = new ClaimsChecker();
                        if (claimsChecker.check(request.claims, user.access)) {
                            request.user = user;
                            resolve();
                        } else {
                            reject('Unauthorized');
                        }
                    } else {
                        reject('Unauthorized user.');
                    }
                }).catch(reject);
            } else {
                reject('Authentication token is not available.');
            }
        });

        attr('async');
        this.func('login', function (resolve, reject, request) {
            var credentials = request.data.credentials || {},
                credentialsValidator = new CredentialsValidator();
            credentialsValidator.validate(credentials).then(function (user) {
                if (user) {
                    jwt = new Jwt();
                    jwt.create(user).then(function (token) {
                        if (token) {
                            var authInfo = new AuthInfo(token, user);
                            request.response.send.json(authInfo);
                            resolve(authInfo);
                        } else {
                            request.response.send.error(401, 'Failed to generate auth token.');
                            reject(401);
                        }
                    }).catch(function (err) {
                        request.response.send.error(401, 'Failed to generate auth token. (' + (err || '') + ')');
                        reject(err);
                    });
                } else {
                    request.response.send.error(401, 'User not found.');
                    reject(401);
                }
            }).catch(function (err) {
                request.response.send.error(401, 'Invalid user name or password. (' + (err || '') + ')');
                reject(err);
            });
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/server/Auth.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/server/JwtToken.js)
define('sys.core.security.server.JwtToken', [use('[Base]'), use('jsonwebtoken')], function (Base, jwt) {
    /**
     * @class sys.core.security.server.JwtToken
     * @classdesc sys.core.security.server.JwtToken
     * @desc JWT Token manager.
     */
    return Class('sys.core.security.server.JwtToken', Base, function (attr) {
        var _this = this;

        attr('async');
        this.func('create', function (resolve, reject, payload) {
            var secret = _this.settings('security.jwt.secretKey', 'adfdef1d-ce1a-470d-a652-f466292acf85'),
                expiresInMinutes = _this.settings('security.jwt.expiresInMinutes', 30),
                token = jwt.sign(payload, secret, {
                expiresIn: expiresInMinutes * 60
            });
            resolve(token);
        });

        attr('async');
        this.func('verify', function (token) {
            var secret = _this.settings('security.jwt.secretKey', 'adfdef1d-ce1a-470d-a652-f466292acf85');
            jwt.verify(token, secret, function (err, payload) {
                if (!err) {
                    resolve(payload);
                } else {
                    reject(err);
                }
            });
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/server/JwtToken.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/binders/xClass.js)
define('sys.core.ui.binders.xClass', [use('sys.core.ui.Binder')], function (Binder) {
    /**
     * @class sys.core.ui.binders.Xclass
     * @classdesc sys.core.ui.binders.Xclass
     * @desc Adds extra class to element, if given value is not empty.
     */
    return Class('sys.core.ui.binders.Xclass', Binder, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base) {
            base();
            _this.binderName = 'xclass';
            _this.isTwoWay = false;
        });

        attr('override');
        this.func('routine', function (base, $el, value) {
            base();
            $el.className += ' ' + value;
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/binders/xClass.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/formatters/Percent.js)
define('sys.core.ui.formatters.Percent', [use('sys.core.ui.Formatter')], function (Formatter) {
    /**
     * @class sys.core.ui.formatters.Percent
     * @classdesc sys.core.ui.formatters.Percent
     * @desc Percent formatter, adds % symbol to given value.
     */
    return Class('sys.core.ui.formatters.Percent', Formatter, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base) {
            base();
            _this.formatterName = 'percent';
            _this.isTwoWay = false;
        });

        attr('override');
        this.func('read', function (base, value) {
            base();
            return value + '%';
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ui/formatters/Percent.js)