define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.comm.Response
     * @classdesc sys.core.comm.Response
     * @desc Response information.
     */
    return Class('sys.core.comm.Response', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, res) => {
            base();
            this.res = res;
        });

        attr('protected');
        this.prop('res', null);
    });
});