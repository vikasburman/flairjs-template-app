define([
    use('sys.core.comm.Response'),
    use('[ErrorInfo]')
], (Response, ErrorInfo) => {
    /**
     * @class app.core.comm.ServerResponse
     * @classdesc app.core.comm.ServerResponse
     * @desc Response information (on server).
     */
    return Class('app.core.comm.ServerResponse', Response, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, res) => {
            base(res);
        });        

        attr('readonly');
        this.prop('send', {
            json: (json, status = 200) => {
                xLog('debug', `${JSON.stringify(json, null, 2)}`);
                this.res.status(status).json(json);
            },
            data: (data, status = 200) => { // data could be text, buffer, array, object
                xLog('debug', `${data}`);
                this.res.status(status).send(data);
            },
            file: (fileName, options = {}) => {
                return new Promise((resolve, reject) => {
                    this.res.sendFile(fileName, options, (err) => {
                        if (err) { 
                            reject(err); 
                        } else {
                            resolve();
                        }
                    });
                });
            },
            download: (fileName, displayName) => {
                return new Promise((resolve, reject) => {
                    this.res.download(fileName, displayName, (err) => {
                        if (err) { 
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            },
            jsonp: (json, status = 200, callbackName = '') => {
                if (callbackName) { this.res.app.set('jsonp callback name', callbackName); } // set
                this.res.status(status).jsonp(json);
                if (callbackName) { this.res.app.set('jsonp callback name', ''); } // clear
            },
            redirect: (path, status) => {
                if (status) {
                    this.res.redirect(status, path);
                } else {
                    this.res.redirect(path);
                }
            },
            err: (err) => {
                let error = new ErrorInfo(err);
                this.send.error(error.code, error.desc);
            },
            error: (status, message) => {
                xLog('debug', status + ': ' + message);
                this.res.status(status).send(message);
            },
            na: (status = 501, message = 'Not Available') => {
                xLog('debug', status + ': ' + message);
                this.res.status(status).send(message);
            },            
            none: (status) => {
                if (status) {
                    this.res.status(status).end();
                } else {
                    this.res.end();
                }
            }
        });

        attr('readonly');
        this.prop('isHeadersSent', () => {
            return this.res.headersSent;
        });

        this.func('setHeader', (...args) => { this.res.append(...args); });
        this.func('setCookie', (...args) => { this.res.cookie(...args); });
        this.func('clearCookie', (...args) => { this.res.clearCookie(...args); });
        this.func('setContentType', (...args) => { this.res.type(...args); });
        this.func('setLocal', (name, value) => { this.res.locals[name] = value; });
        this.func('getLocal', (name, defaultValue) => { return (this.res.locals[name] || defaultValue); });
    });
});