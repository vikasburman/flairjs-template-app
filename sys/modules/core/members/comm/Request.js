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
        this.func('constructor', (base, req, res, access) => {
            base();
            this.access = access;
        });

        attr('readonly');
        this.prop('url', null);

        attr('readonly');
        this.prop('access', null);

        attr('readonly');
        this.prop('query', null);

        attr('readonly');
        this.prop('args', null);
    });
});