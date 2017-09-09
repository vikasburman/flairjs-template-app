define([
    use('[Base]')
], (Base) => {
    /**
     * @class app.core.comm.Context
     * @classdesc app.core.comm.Context
     * @desc Request context information (on server).
     */
    return Class('app.core.comm.Context', Base, function(attr) {
        attr('override');
        this.func('constructor', (base, user) => {
            base();
            this.user = user;
        });

        attr('readonly');
        this.prop('user');
    });
});