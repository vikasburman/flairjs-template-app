define([
    use('[Binder]')
], (Binder) => {
    /**
     * @class web.core.ui.binders.Xclass
     * @classdesc web.core.ui.binders.Xclass
     * @desc Adds extra class to element, if given value is not empty.
     */    
    return Class('web.core.ui.binders.Xclass', Binder, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base();
            this.binderName = 'xclass';
            this.isTwoWay = false;
        });

        attr('override');
        this.func('routine', (base, $el, value) => {
            base();
            $el.className += ' ' + value;
        });
    });
});