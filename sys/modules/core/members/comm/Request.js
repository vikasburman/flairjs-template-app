define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.comm.Request
     * @classdesc sys.core.comm.Request
     * @desc Request information.
     */
    return Class('sys.core.comm.Request', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, handler, url, args) => {
            base();
            this.handler = handler;
            this.url = url;
            this.args = args; // if url is -> abc/:name, .name will be available here
        });

        attr('readonly');
        this.prop('handler');

        attr('readonly');
        this.prop('url');

        attr('once');
        this.prop('originalUrl');

        attr('readonly');
        this.prop('args');

        attr('once');
        this.prop('user');

        attr('once');
        this.prop('claims');

        attr('once');
        this.prop('query');
    });
});