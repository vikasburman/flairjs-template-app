define([
    use('sys.core.comm.Response')
], (Response) => {
    /**
     * @class sys.core.comm.ClientResponse
     * @classdesc sys.core.comm.ClientResponse
     * @desc Response information (on client).
     */
    return Class('sys.core.comm.ClientResponse', Response, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, res, err, data) => {
            base(res);
            this.error = err || null;
            this.data = data;
            this.isError = (err ? true : false);
            this.isRedirected = (res ? res.redirected : false);
            this.status = (res ? res.status : err);
            this.statusText = (res ? res.statusText : 'Error: ' + err);
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

        this.func('getHeader', (name) => { this.res.headers.get(name); });
        this.func('getContentType', () => { this.getHeader('Content-Type'); });
    });
});