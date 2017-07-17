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
        this.prop('handler', null);

        attr('readonly');
        this.prop('url', '');

        attr('readonly');
        this.prop('args', null);

        attr('readonly');
        attr('once');
        this.prop('access', null);

        attr('readonly');
        attr('once');
        this.prop('query', null);
    });
});