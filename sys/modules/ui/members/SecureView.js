define([
    use('[View]')
], (View) => {
    /**
     * @class sys.core.ui.SecureView
     * @classdesc sys.core.ui.SecureView
     * @desc Base class for all secure (auth enabled) view classes.
     */
    return Class('sys.core.ui.SecureView', View, function(attr) {
        attr('override');
        this.func('view', (base) => {
            // TODO: auth first 

            // now call base
            return base();
        });
    });
});