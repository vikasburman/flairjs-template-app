define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.ui.Formatter
     * @classdesc sys.core.ui.Formatter
     * @desc Formatter base class to define custom formatters for rivets.
     */    
    return Class('sys.core.ui.Formatter', Base, function(attr) {
        this.prop('formatterName', '');
        this.func('read', this.noop);
        this.func('publish', this.noop);
        this.func('isTwoWay', false);
    });
});