define([
    use('sys.core.ui.Component'),
    use('sys.core.ui.ComponentTypes')
], (Component, ComponentTypes) => {
    /**
     * @class sys.core.ui.Partial
     * @classdesc sys.core.ui.Partial
     * @desc Partial base class.
     */    
    return Class('sys.core.ui.Partial', Component, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, parent, args) => {
            base(ComponentTypes.Partial, parent, args);
        });

        attr('protected');
        attr('once');
        this.prop('tagName', '');
   });
});