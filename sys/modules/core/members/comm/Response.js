define(() => {
    /**
     * @class sys.core.comm.Response
     * @classdesc sys.core.comm.Response
     * @desc Response information.
     */
    return Class('sys.core.comm.Response', function(attr) {
        attr('abstract');
        this.func('constructor', (res) => {
            this.res = res;
        });

        attr('protected');
        this.prop('res', null);
    });
});