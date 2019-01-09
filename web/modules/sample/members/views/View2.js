define([
    use('[View]'),
    use('web.sample.shells.Full')
], (View, Shell) => {
    /**
     * @class web.sample.views.View2
     * @classdesc web.sample.views.View2
     * @desc Home view.
     */
    return Class('web.sample.views.View2', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
        });

        this.template = '<div><a href="#/">goto Home</a></div>';
    });
});