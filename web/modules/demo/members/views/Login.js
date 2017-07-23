define([
    use('sys.core.ui.View'),
    use('web.demo.shells.Empty')
], (View, Shell) => {
    /**
     * @class web.demo.views.Login
     * @classdesc web.demo.views.Login
     * @desc Access control for a chatbot.
     */
    return Class('web.demo.views.Login', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
            this.data.title = 'Login To Continue';
        });

        attr('override');
        attr('async');
        this.func('beforeShow', (base, resolve, reject) => {
            base().then(resolve).catch(reject);
        });
    });
});