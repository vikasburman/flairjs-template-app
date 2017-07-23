define([
    use('sys.core.ui.Component'),
    use('sys.core.ui.ComponentTypes')
], (Component, ComponentTypes) => {
    /**
     * @class sys.core.ui.Shell
     * @classdesc sys.core.ui.Shell
     * @desc Shell base class.
     */    
    return Class('sys.core.ui.Shell', Component, function(attr) {
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