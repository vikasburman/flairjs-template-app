define([
    use('[Base]'),
    use('[IBootware]'),
    use('[Auth]'),
    use('sys.core.comm.ClientResponse')
], (Base, IBootware, Auth, FetchResponse) => {
    /**
     * @class sys.core.bootwares.Attributes
     * @classdesc sys.core.bootwares.Attributes
     * @desc Define global framework attributes.
     */    
    return Class('sys.core.bootwares.Attributes', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // fetch
            // fetch(url, [options])
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
            Container.register(Class('fetch', Attribute, function() {
                this.decorator((obj, type, name, descriptor) => {
                    // validate
                    if (['func'].indexOf(type) === -1) { throw `fetch attribute cannot be applied on ${type} members. (${name})`; }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) { throw `fetch attribute cannot be applied on special function. (${name})`; }

                    // decorate
                    let fetchUrl = this.args[0] || '',
                        staticOpts = this.args[1] || {},
                        fn = descriptor.value,
                        fnArgs = null,
                        enableCookies = staticOpts.enableCookies || false,
                        responseDataType = staticOpts.responseDataType || null,
                        requestDataType = staticOpts.requestDataType || null,
                        auth = staticOpts.auth || null,
                        pre =  staticOpts.pre || null;
                    if (staticOpts.responseDataType) { delete staticOpts.responseDataType; }
                    if (staticOpts.requestDataType) { delete staticOpts.requestDataType; }
                    if (staticOpts.auth) { delete staticOpts.auth; }    
                    if (staticOpts.pre) { delete staticOpts.pre; }    
                    if (staticOpts.enableCookies) { delete staticOpts.enableCookies; }    
                    descriptor.value = function(urlFillsOrInputData, inputData) {
                        // pre-processing of args
                        let inputArgs = {
                            url: null,
                            body: null
                        },
                        _fetchUrl = fetchUrl;
                        if (_fetchUrl.indexOf('/:') === -1) { // e.g., items/:id or http://www.abc.com/items/:type/:id or /home#/pages/:page
                            inputArgs.body = urlFillsOrInputData; // that means, only inputData is passed as first argument and not urlFills
                        } else {
                            inputArgs.url = urlFillsOrInputData;
                            inputArgs.body = inputData;
                        }
                        if (typeof pre === 'function') {
                            pre(inputArgs);
                        }

                        // build url
                        if (inputArgs.url) {
                            for(let fill in inputArgs.url) {
                                if (inputArgs.url.hasOwnProperty(fill)) {
                                    _fetchUrl = _fetchUrl.replace('/:' + fill, encodeURIComponent('/' + inputArgs.url[fill].toString()));
                                }
                            }
                        }

                        // fetch
                        return new Promise((resolve, reject) => {
                            let onFetch = (err, response, data) => {
                                fnArgs = [resolve, reject, new FetchResponse(response, err, data)];
                                fn(...fnArgs);
                            };
                            if (_fetchUrl) {
                                // staticOpts: can be all that fetch's init argument expects
                                //             additionally it can have
                                if(inputArgs.body) {
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

                                // actual fetch
                                let doFetch = () => {
                                    fetch(_fetchUrl, staticOpts).then((response) => {
                                        if (response.ok) {
                                            switch(responseDataType) {
                                                case 'json':
                                                    response.json().then((data) => {
                                                        onFetch(null, response, data);
                                                    }).catch((err) => {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'blob':
                                                    response.blob().then((data) => {
                                                        onFetch(null, response, data);
                                                    }).catch((err) => {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'buffer':
                                                    response.arrayBuffer().then((data) => {
                                                        onFetch(null, response, data);
                                                    }).catch((err) => {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;                                    
                                                case 'formData': 
                                                    response.formData().then((data) => {
                                                        onFetch(null, response, data);
                                                    }).catch((err) => {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'objectUrl':
                                                    response.blob().then((data) => {
                                                        onFetch(null, response, URL.createObjectURL(data));
                                                    }).catch((err) => {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                                case 'text': 
                                                default:
                                                    response.text().then((data) => {
                                                        onFetch(null, response, data);
                                                    }).catch((err) => {
                                                        onFetch(err, response, null);
                                                    });
                                                    break;
                                            }
                                        } else {
                                            onFetch(response.status, response, null);
                                        }
                                    }).catch((err) => {
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

                                // auth
                                if (auth) {
                                    let applyHeaders = (authHeaders) => {
                                        for(let authHeader in authHeaders) {
                                            if (authHeaders.hasOwnProperty(authHeader)) {
                                                staticOpts.headers = staticOpts.headers || {};
                                                staticOpts.headers[authHeader] = authHeaders[authHeader];
                                            }
                                        }
                                    };
                                    if (typeof auth === 'function') {
                                        auth(name).then((authHeaders) => {
                                            applyHeaders(authHeaders);
                                            doFetch();
                                        }).catch((err) => {
                                            onFetch(err, null, null);
                                        });
                                    } else if (typeof auth === 'string' && auth === 'auto') {
                                        if (this.env.isServer) {
                                            onFetch('invalid auth settings for server.', null, null);
                                        } else {
                                            let auth = new Auth();
                                            applyHeaders(auth.getTokenHeader());
                                            doFetch();
                                        }
                                    } else {
                                        onFetch('invalid auth settings.', null, null);
                                    }
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
            //  'name', 'name1 || name2', 'name1 || name2 || ...'
            //  to have AND relationship among claims, put them as a seperate claimName string
            //  e.g., all of these are valid examples (NOTE: only one claims attribute is allowed)
            //  attr('claims', 'auth');
            //  attr('claims', 'name1', 'name2 || name3'); // means name1 AND (name2 OR name3)
            Container.register(Class('claims', Attribute, function() {
                this.decorator((obj, type, name, descriptor) => {
                    // validate
                    if (['func'].indexOf(type) === -1) { throw `claims attribute cannot be applied on ${type} members. (${name})`; }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) { throw `claims attribute cannot be applied on special function. (${name})`; }

                    // decorate
                    let fn = descriptor.value,
                        claims = this.args || null,
                        fnArgs = null;
                    descriptor.value = function(request) {
                        // authenticate and serve request
                        let onAuth = () => {
                            fnArgs = [request];
                            fn(...fnArgs);                                    
                        };
                        if (claims) {
                            request.claims = claims;
                            let auth = new Auth();
                            auth.validate(request).then(onAuth).catch((err) => {
                                console.log(`Failed to authenticate ${document.location.hash}. (${err})`);
                                if (this.env.isServer) {
                                    request.response.send.error(401, err);
                                } else {
                                    let loginUrl = settings('sys.core:view.login');
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