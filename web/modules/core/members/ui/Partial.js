define([
    use('[Component]'),
    use('[ComponentTypes]')
], (Component, ComponentTypes) => {
    /**
     * @class web.core.ui.Partial
     * @classdesc web.core.ui.Partial
     * @desc Partial base class.
     */    
    return Class('web.core.ui.Partial', Component, function(attr) {
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