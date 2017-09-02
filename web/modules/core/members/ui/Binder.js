define([
    use('[Base]')
], (Base) => {
    /**
     * @class web.core.ui.Binder
     * @classdesc web.core.ui.Binder
     * @desc Binder base class to define custom binders for rivets.
     */    
    return Class('web.core.ui.Binder', Base, function(attr) {
        this.prop('binderName', '');
        this.func('bind', this.noop);
        this.func('unbind', this.noop);
        this.func('routine', this.noop);
        this.func('getValue', this.noop);
        this.prop('isTwoWay', false);
        this.prop('publishes', false);
        this.prop('block', false);
    });
});