define([
    use('sys.core.app.App')
], (App) => {
    /**
     * @class web.core.app.ClientApp
     * @classdesc web.core.app.ClientApp
     * @desc Starts client application.
     */       
    return Class('web.core.app.ClientApp', App, function(attr) {
        this.func('navigate', (url, returnUrlORisReplace) => {
            let currentHash = document.location.hash.replace('#', '');
            if (typeof returnUrlORisReplace === 'string') {
                url += '?returnUrl=' + returnUrlORisReplace;
                if (url.substr(0, 1) === '#') { url = url.substr(1); }
                document.location.replace('#' + url);
            } else if (typeof returnUrlORisReplace === 'boolean' && returnUrlORisReplace) {
                if (url.substr(0, 1) === '#') { url = url.substr(1); }
                document.location.replace('#' + url);
            } else {
                document.location.hash = url;
            }
            if (currentHash === url) {
                // trigger onhashchange manually, since same hash was already there
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
        });
    });
});