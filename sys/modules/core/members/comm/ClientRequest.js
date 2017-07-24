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
        this.func('constructor', (base, handler, url, args) => {
            base(handler, url, args); 
            let fullUrl = document.location.hash;
            if (fullUrl.indexOf('?') !== -1) {
                this.query = this.env.queryStringToObject(fullUrl.split('?')[1]); // query strings
            }
        });
    });
});