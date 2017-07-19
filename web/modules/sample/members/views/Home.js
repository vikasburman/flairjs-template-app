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

        attr('override');
        attr('endpoint');
        this.func('navigate', (base, resolve, reject, request) => {
            console.log('initiating navigate');
            base(request).then(() => {
                console.log('navigation done.');
                resolve();
            }).catch(reject);
        });

        attr('protected');
        attr('override');
        attr('async');
        this.func('beforeShow', (base, resolve, reject) => {
            this.data.title = 'This is View Title - vikas';
            resolve();
        });

        this.handler('addCounter', ($el, e) => {
            this.pub('AddCounter');
        });
    });
});