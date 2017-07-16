define([
    use('sys.core.app.App')
], (App) => {
    /**
     * @class sys.core.app.Client
     * @classdesc sys.core.app.Client
     * @desc Starts client application.
     */       
    return Class('sys.core.app.Client', App, function(attr) {
        attr('override');
        this.func('navigate', (base, url) => {
            base();
            document.location.hash = url;
        });
    });
});