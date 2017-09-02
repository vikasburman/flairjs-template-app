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
            xLog('error', 'Error in ' + _this._.name + ' (' + _this.errorText(err) + ')');
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
        this.prop('code', config.env.isServer ? '500' : '5000');
        this.prop('desc', '');
        this.prop('details', '');
        this.prop('raw', null);
        this.prop('stack', '');
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/ErrorInfo.js)
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Attributes.js)
define('sys.core.bootwares.Attributes', [use('[Base]'), use('[IBootware]'), use('[Auth]'), use('[ValueValidator]'), use('sys.core.comm.ClientResponse')], function (Base, IBootware, Auth, ValueValidator, FetchResponse) {
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
                                    xLog('error', 'Failed to authenticate ' + request.url + '. (' + _this4.errorText(err) + ')');
                                    request.response.send.error(401, err);
                                } else {
                                    xLog('error', 'Failed to authenticate ' + document.location.hash + '. (' + _this4.errorText(err) + ')');
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

            // check
            // check(comma delimited array of all data validation checks to apply on property value being set)
            //  each array can container any number of values, where
            //   0th index: name of data validation to perform OR a function that will be called to do data validation
            //   1st to nth index: values that will be passed to data validation function identified at 0th index
            //  whether inbuilt or custom function, on execution it will return true or an ErrorInfo object if failed
            // attr('check, 
            //     ['null', false],
            //     ['type', 'number'],
            //     ['range', 0, 10]
            //     [myFn1, 'gte', 7]
            //     [myFn2, false]
            // )
            Container.register(Class('check', Attribute, function () {
                var _this5 = this;

                this.decorator(function (obj, type, name, descriptor) {
                    // validate
                    if (['prop'].indexOf(type) === -1) {
                        throw 'check attribute cannot be applied on ' + type + ' members. (' + name + ')';
                    }

                    // decorate
                    var validations = _this5.args || null,
                        validator = new ValueValidator(),
                        err = null;
                    if (descriptor.set) {
                        var _set = descriptor.set;
                        descriptor.set = function (value) {
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = validations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var validationCfg = _step.value;

                                    err = validator.validate.apply(validator, [value].concat(_toConsumableArray(validationCfg)));
                                    if (err) {
                                        xLog('error', 'Validation failed for: ' + obj._.name + '.' + name + '. (' + this.errorText(err) + ')');
                                        throw err;
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

                            return _set(value);
                        }.bind(obj);
                    }
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
                xLog('debug', 'routes fallback to 404');

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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Locales.js)
define('sys.core.bootwares.Locales', [use('[Base]'), use('[IBootware]'), use('[ErrorInfo]')], function (Base, IBootware, ErrorInfo) {
    /**
     * @class sys.core.bootwares.Locales
     * @classdesc sys.core.bootwares.Locales
     * @desc Configure locales and i18n basics on server and client.
     */
    return Class('sys.core.bootwares.Locales', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // load definitions
            var defaultLocale = _this.settings('locales.default', 'en-us'),
                defaultLocaleInfo = { lcid: '1033', display: 'English (United States)', rtl: false },
                supportedLocales = _this.settings('locales.supported', {
                'en-us': defaultLocaleInfo
            });

            // extend env (in global config) for locales related operations
            config.env.getLocale = function () {
                var locale = '';
                if (!_this.env.isServer) {
                    locale = sessionStorage.getItem('locale') || defaultLocale;
                } else {
                    var currentRequest = config.env.currentRequest();
                    locale = (currentRequest ? currentRequest.getLocale() : '') || defaultLocale;
                }
                var localeObj = supportedLocales[locale];
                if (!localeObj) {
                    localeObj = defaultLocaleInfo;
                }
                localeObj.name = locale;
                return localeObj;
            };
            config.env.getLocales = function () {
                var items = [],
                    item = null;
                for (var locale in supportedLocales) {
                    if (supportedLocales.hasOwnProperty(locale)) {
                        item = supportedLocales[locale];
                        item.name = locale;
                        items.push(item);
                    }
                }
                return items;
            };

            // further extend env for client only
            if (!_this.env.isServer) {
                config.env.setLocale = function (locale, isSupressRefresh) {
                    if (supportedLocales[locale]) {
                        sessionStorage.setItem('locale', locale);
                        if (!isSupressRefresh) {
                            location.reload();
                        }
                    }
                };
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Locales.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/bootwares/Router.js)
define('sys.core.bootwares.Router', [use('[Base]'), use('[IBootware]'), use(' | sys/core/libs/pathparser{.min}.js'), use('app.core.comm.ServerRequest | sys.core.comm.ClientRequest'), use('sys.core.comm.Handler')], function (Base, IBootware, RouteManager, Request, Handler) {
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
                routesKey = _this.env.isServer ? ':routes.server' : ':routes.client',
                apiPrefix = _this.env.isServer ? _this.settings('api.root', '') : '',
                versionPrefix = _this.env.isServer ? _this.settings('api.version', '') : '';

            var getHandler = function getHandler(fullUrl, route) {
                return function (req, res) {
                    // router here is express app.
                    xLog('debug', 'route hit: ' + fullUrl);
                    try {
                        var handler = new Handler(route.class, route.func),
                            request = new Request(handler, route.verb, req, res);
                        handler.handle(request);
                    } catch (err) {
                        xLog('error', 'Error handling ' + fullUrl + '. \n ' + this.errorText(err));
                        res.status(500).end();
                    }
                };
            };

            // each route definition (both on server and client) is as:
            // { "ver":"1", "root":"", url": "", "verb": "", "class": "", "func": ""}
            // ver: 
            //  on server, this represents version of the api
            //  on client, this is not required
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
            routesOrder.unshift(_this.env.getMainModule()); // add main module by default, on top both in server and client side
            routesOrder.unshift(_this.assembly); // add sys.core (current module) by default, on top of main module, both in server and client side
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = routesOrder[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var routesOf = _step.value;

                    xLog('debug', 'routes of: ' + routesOf);
                    routes = _this.settings(routesOf + routesKey, []);

                    var _loop = function _loop(route) {
                        if (route.url && route.class) {
                            fullUrl = (route.root || '') + route.url;
                            fullUrl = fullUrl.replace('//', '/');
                            if (_this.env.isServer) {
                                if (apiPrefix) {
                                    fullUrl = apiPrefix + '/' + versionPrefix + (route.ver || "1") + fullUrl;
                                }
                                if (route.func && route.verb) {
                                    if (['get', 'post', 'put', 'delete'].indexOf(route.verb) === -1) {
                                        throw 'Unknown verb for: ' + route.url;
                                    }
                                    router[route.verb](fullUrl, getHandler(fullUrl, route));
                                    xLog('debug', '  ' + route.verb + ': ' + fullUrl);
                                } else {
                                    var err = 'Invalid route definiton: ' + fullUrl + '#' + route.verb;
                                    xLog('error', err);
                                    throw err;
                                }
                            } else {
                                router.add(fullUrl, function () {
                                    // "this"" will have all route values (e.g., abc/xyz when resolved against abc/:name will have name: 'xyz' in this object)
                                    var handler = new Handler(route.class, 'navigate'),
                                        request = new Request(handler, route.url, this);
                                    try {
                                        handler.handle(request);
                                    } catch (err) {
                                        xLog('error', 'Error handling ' + fullUrl + '. \n ' + this.errorText(err));
                                        throw err;
                                    }
                                });
                                xLog('debug', '  navigate: ' + fullUrl);
                            }
                        } else {
                            var _err = 'Invalid route definiton: ' + fullUrl;
                            xLog('error', _err);
                            throw _err;
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
                    xLog('error', errorText.replace('%ERROR%', _this.errorText(err)));
                });
            }).catch(function (err) {
                xLog('error', errorText.replace('%ERROR%', _this.errorText(err)));
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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ServiceAdapter.js)
define('sys.core.comm.ServiceAdapter', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.comm.ServiceAdapter
     * @classdesc sys.core.comm.ServiceAdapter
     * @desc Service adapter base.
     */
    return Class('sys.core.comm.ServiceAdapter', Base, function (attr) {});
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/comm/ServiceAdapter.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/ValueValidator.js)
define('sys.core.data.ValueValidator', function () {
    /**
     * @class sys.core.data.ValueValidator
     * @classdesc sys.core.data.ValueValidator
     * @desc Data value validator.
     */
    return Class('sys.core.data.ValueValidator', function (attr) {
        var _this = this;

        attr('singleton');
        this.func('constructor', function () {});

        this.func('validate', function (dataValue, validator) {
            for (var _len = arguments.length, validationCfg = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                validationCfg[_key - 2] = arguments[_key];
            }

            var fn = null,
                result = null;
            if (typeof validator === 'function') {
                fn = validator;
            } else {
                fn = _this[validator + 'Check']; // a private function with check type name suffixed with 'Check'
            }

            // validate
            try {
                fn.apply(undefined, [dataValue].concat(validationCfg));
            } catch (err) {
                xLog('error', '' + _this.errorText(err));
                result = err;
            }
            return result;
        });

        attr('private');
        this.func('nullCheck', function (dataValue) {
            if (dataValue === null) {
                throw 'Null values are not allowed.';
            }
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/data/ValueValidator.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/domain/Dto.js)
define('sys.core.domain.Dto', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.domain.Dto
     * @classdesc sys.core.domain.Dto
     * @desc Dto base.
     */
    return Class('sys.core.domain.Dto', Base, function (attr) {
        // basic input validations can be done here 
        // by using 'check' attribute on properties
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/domain/Dto.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/AuthInfo.js)
define('sys.core.security.AuthInfo', function () {
    /**
     * @class sys.core.security.AuthInfo
     * @classdesc sys.core.security.AuthInfo
     * @desc User auth information.
     */
    return Structure('sys.core.security.AuthInfo', function (token, user) {
        this.token = token;
        this.user = user;
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/AuthInfo.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/ClaimsChecker.js)
define('sys.core.security.ClaimsChecker', function () {
    /**
     * @class sys.core.security.ClaimsChecker
     * @classdesc sys.core.security.ClaimsChecker
     * @desc Check claims.
     */
    return Class('sys.core.security.ClaimsChecker', function (attr) {
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

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/Credentials.js)
define('sys.core.security.Credentials', function () {
    /**
     * @class sys.core.security.Credentials
     * @classdesc sys.core.security.Credentials
     * @desc Login credentials.
     */
    return Structure('sys.core.security.Credentials', function (loginId, pwd) {
        var clientId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        this.clientId = clientId;
        this.loginId = loginId;
        this.pwdHash = pwd;
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/Credentials.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/Hash.js)
define('sys.core.security.Hash', [use('[Base]'), use('sys/core/libs/md5{.min}.js')], function (Base) {
    /**
     * @class sys.core.security.Hash
     * @classdesc sys.core.security.Hash
     * @desc Hash creator.
     */
    return Class('sys.core.security.Hash', Base, function (attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', function (base) {
            base();
        });

        this.func('get', function (text) {
            return CryptoJS.MD5(text).toString();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/Hash.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/User.js)
define('sys.core.security.User', function () {
    /**
     * @class sys.core.security.User
     * @classdesc sys.core.security.User
     * @desc User information.
     */
    return Structure('sys.core.security.User', function (loginId, name, roles, access) {
        var clientId = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

        this.clientId = clientId;
        this.loginId = loginId;
        this.name = name;
        this.roles = roles;
        this.access = access;
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/security/User.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/App.js)
define('sys.core.app.App', [use('[Base]'), use('[IApp]')], function (Base, IApp) {
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

        this.func('navigate', function (url) {
            xLog('debug', 'navigate: ' + url);
        });

        attr('readonly');
        this.prop('info', {});
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/core/members/app/App.js)
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