define([
    use('sys.core.comm.Request'),
    use('app.core.comm.ServerResponse'),
], (Request, Response) => {
    /**
     * @class app.core.comm.ServerRequest
     * @classdesc app.core.comm.ServerRequest
     * @desc Request information (on server).
     */
    return Class('app.core.comm.ServerRequest', Request, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, handler, verb, req, res) => {
            base(handler, req.originalUrl, req.params);
            this.verb = verb;
            this.req = req;
            this.res = res;
            this.response = new Response(res);
            this.data = req.body;
            this.isSecure = req.secure;
            this.isFresh = req.fresh;
            this.hostname = req.hostname;
            this.subdomains = req.subdomains;
            this.protocol = req.protocol;
            this.query = req.query;
            this.originalUrl = req.originalUrl;
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

        attr('readonly');
        this.prop('hostname', '');

        attr('readonly');
        this.prop('subdomains', []);

        attr('readonly');
        this.prop('protocol', '');

        this.func('getLocale', () => { return this.getHeader('userLocale'); })
        this.func('getToken', () => { return this.req.token || null; });
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