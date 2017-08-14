define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.Entity
     * @classdesc sys.core.data.Entity
     * @desc Data entity.
     */    
    return Class('sys.core.data.Entity', Base, function(attr) {
        attr('abstract');
        this.func('constructor', () => {
        });
    });
});