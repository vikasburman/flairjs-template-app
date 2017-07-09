define([
    use('[Base]'),
    use('[IBootware]'),
    use('sys.core.comm.ServerRequest | sys.core.comm.ClientRequest'),
    use('sys.core.comm.ServerResponse | sys.core.comm.ClientResponse')
], (Base, IBootware, Request, Response) => {
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
            //      - responseDataType: text, json, blob, buffer, formData, objectUrl
            //      - auth: a function reference, that gives access headers for fetch operation (key-value pairs returned from here are added under headers)
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
                        authFn = staticOpts.auth || null;
                    if (staticOpts.responseDataType) { delete staticOpts.responseDataType; }
                    if (staticOpts.auth) { delete staticOpts.auth; }    
                    if (staticOpts.enableCookies) { delete staticOpts.enableCookies; }    
                    descriptor.value = function(urlFillsOrInputData, inputData) {
                        // build url
                        let _fetchUrl = fetchUrl;
                        if (_fetchUrl.indexOf('/:') === -1) { // e.g., items/:id or http://www.abc.com/items/:type/:id or /home#/pages/:page
                            inputData = urlFillsOrInputData; // that means, only inputData is passed as first argument and not urlFills
                        } else {
                            for(let fill in urlFillsOrInputData) {
                                if (urlFillsOrInputData.hasOwnProperty(fill)) {
                                    _fetchUrl = _fetchUrl.replace('/:' + fill, encodeURIComponent('/' + urlFillsOrInputData[fill].toString()));
                                }
                            }
                        }

                        // fetch
                        return new Promise((resolve, reject) => {
                            let onFetch = (err, response, data) => {
                                fnArgs = [resolve, reject, new Response(response, err, data)];
                                fn(...fnArgs);
                            };
                            if (_fetchUrl) {
                                // staticOpts: can be all that fetch's init argument expects
                                //             additionally it can have
                                if(inputData) {
                                    if (staticOpts.headers && staticOpts.headers['Content-Type'] && staticOpts.headers['Content-Type'].indexOf('json') !== -1) {
                                        staticOpts.body = JSON.stringify(inputData); // json
                                    } else {
                                        staticOpts.body = inputData; // could be text, buffer, array, object or formData
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

                                // auth headers
                                if (typeof authFn === 'function') {
                                    authFn(name).then((authHeaders) => {
                                        for(let authHeader in authHeaders) {
                                            if (authHeaders.hasOwnProperty(authHeader)) {
                                                staticOpts.headers = staticOpts.headers || {};
                                                staticOpts.headers[authHeader] = authHeaders[authHeader];
                                            }
                                        }
                                        doFetch();
                                    }).catch((err) => {
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
            Container.register(Class('endpoint', Attribute, function() {
                this.decorator((obj, type, name, descriptor) => {
                    // validate
                    if (['func'].indexOf(type) === -1) { throw `endpoint attribute cannot be applied on ${type} members. (${name})`; }
                    if (['_constructor', '_dispose'].indexOf(type) !== -1) { throw `endpoint attribute cannot be applied on special function. (${name})`; }

                    // decorate
                    let fn = descriptor.value,
                        opts = this.args[0] || {},
                        auth = opts.auth || false,
                        access = opts.access || [],
                        fnArgs = null;
                    descriptor.value = function(req, res) {
                        // authenticate and serve request
                        return new Promise((resolve, reject) => {
                            let request = new Request(req, new Response(res), access);
                            let onAuth = () => {
                                fnArgs = [resolve, reject, request];
                                fn(...fnArgs);                                    
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
            
            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);          
    });
});