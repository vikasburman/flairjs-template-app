define([
    use('[Component]'),
    use('[ComponentTypes]')
], (Component, ComponentTypes) => {
    /**
     * @class web.core.ui.Shell
     * @classdesc web.core.ui.Shell
     * @desc Shell base class.
     */    
    return Class('web.core.ui.Shell', Component, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, args, view) => {
            base(ComponentTypes.Shell, null, args);
            this.child = view;
        });

        attr('readonly');
        this.prop('child', null);        
    });
});