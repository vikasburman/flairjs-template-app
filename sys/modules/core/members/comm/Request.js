define(() => {
    /**
     * @class sys.core.comm.Request
     * @classdesc sys.core.comm.Request
     * @desc Request information.
     */
    return Class('sys.core.comm.Request', function(attr) {
        attr('abstract');
        this.func('constructor', (req, res, access) => {
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