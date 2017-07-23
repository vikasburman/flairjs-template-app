define([
    use('sys.core.ui.View'),
    use('web.demo.shells.Basic'),
    use('web.demo.Chatbots')
], (View, Shell, Chatbots) => {
    /**
     * @class web.demo.views.Home
     * @classdesc web.demo.views.Home
     * @desc Demo console home screen.
     */
    return Class('web.demo.views.Home', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
        });

        attr('override');
        attr('async');
        this.func('beforeShow', (base, resolve, reject) => {
            base().then(() => {
                let chatbots = new Chatbots();
                chatbots.getDemos().then((demos) => {
                    this.data.chatbots = demos;
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });

        this.data('chatbots', []);
    });
});