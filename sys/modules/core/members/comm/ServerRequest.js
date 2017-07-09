define([
    use('sys.core.comm.Request')
], (Request) => {
    /**
     * @class sys.core.comm.ServerRequest
     * @classdesc sys.core.comm.ServerRequest
     * @desc Request information (on server).
     */
    return Class('sys.core.comm.ServerRequest', Request, function(attr) {
        attr('override');
        this.func('constructor', (base, req, response, access) => {
            base(req, response, access);
            this.req = req;
            this.response = response;
            this.data = req.body;
            this.isSecure = req.secure;
            this.isFresh = req.fresh;
            this.url = req.originalUrl;
            this.args = req.params; // if url is -> abc/:name, .name will be available here
            this.query = req.query; // query strings, if any
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

        this.func('getHeader', (...args) => { return this.req.get(...args); });
        this.func('getCookie', (name, isSigned) => { 
            if (isSigned) {
                return this.req.signedCookies[name];
            } else {
                return this.req.cookies[name];
            }
        });
        this.func('isContentType', (...args) => { return this.req.is(...args); });
        this.func('accepts', (...args) => { return this.req.accepts(...args); });
        this.func('acceptsCharsets', (...args) => { return this.req.acceptsCharsets(...args); });
        this.func('acceptsEncodings', (...args) => { return this.req.acceptsEncodings(...args); });
        this.func('acceptsLanguages', (...args) => { return this.req.acceptsLanguages(...args); });
    });
});