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

        attr('override');
        attr('endpoint');
        this.func('navigate', (base, resolve, reject, request) => {
            console.log('initiating navigate');
            base(request).then(() => {
                console.log('navigation done.');
                resolve();
            }).catch(reject);
        });
    });
});