define([
    use('[Base]')
], (Base) => {
    /**
     * @class web.core.ui.Formatter
     * @classdesc web.core.ui.Formatter
     * @desc Formatter base class to define custom formatters for rivets.
     */    
    return Class('web.core.ui.Formatter', Base, function(attr) {
        this.prop('formatterName', '');
        this.func('read', this.noop);
        this.func('publish', this.noop);
        this.prop('isTwoWay', false);
    });
});