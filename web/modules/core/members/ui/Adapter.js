define([
    use('[Base]')
], (Base) => {
    /**
     * @class web.core.ui.Adapter
     * @classdesc web.core.ui.Adapter
     * @desc Adapter base class to define custom adapters for rivets.
     */    
    return Class('web.core.ui.Adapter', Base, function(attr) {
        this.prop('adapterName', '');
        this.func('observe', this.noop);
        this.func('unobserve', this.noop);
        this.func('get', this.noop);
        this.func('set', this.noop);
    });
});