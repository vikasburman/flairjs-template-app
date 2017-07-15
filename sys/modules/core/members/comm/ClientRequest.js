define([
    use('sys.core.comm.Request')
], (Request) => {
    /**
     * @class sys.core.comm.ClientRequest
     * @classdesc sys.core.comm.ClientRequest
     * @desc Request information (on client).
     */
    return Class('sys.core.comm.ClientRequest', Request, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, req, response, access) => {
            base(req, null, access); // no need to send response in a client request, it does not apply here
            this.url = req.url;
            this.args = req; // if url is -> abc/:name, .name will be available here
            this.query = req; // query strings, if any
        });
    });
});