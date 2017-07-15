define([
    use('sys.core.ui.View'),
    use('web.sample.shells.Full')
], (View, Shell) => {
    /**
     * @class web.sample.views.Home
     * @classdesc web.sample.views.Home
     * @desc Home view.
     */
    return Class('web.sample.views.Home', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
        });
    });
});