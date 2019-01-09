define([
    use('[View]'),
    use('web.sample.shells.Full')
], (View, Shell) => {
    /**
     * @class web.sample.views.View1
     * @classdesc web.sample.views.View1
     * @desc Home view.
     */
    return Class('web.sample.views.View1', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
        });
    });
});