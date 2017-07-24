define([
    use('sys.core.ui.View'),
    use('web.demo.shells.Empty')
], (View, Shell) => {
    /**
     * @class web.demo.views.Chatbot
     * @classdesc web.demo.views.Chatbot
     * @desc Chatbot demo.
     */
    return Class('web.demo.views.Chatbot', View, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base(Shell);
        });

        attr('override');
        attr('claims', 'auth');
        this.func('navigate', (base, request) => {
            base(request);
        });
    });
});