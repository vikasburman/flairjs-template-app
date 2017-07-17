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
            let currentHash = document.location.hash.replace('#', '');
            document.location.hash = url;
            if (currentHash === url) {
                // trigger onhashchange manually, since same hash was alredy there
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
        });
    });
});