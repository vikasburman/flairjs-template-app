define([
    use('sys.core.app.App')
], (App) => {
    /**
     * @class sys.core.app.Server
     * @classdesc sys.core.app.Server
     * @desc Starts server application.
     */         
    return Class('sys.core.app.Server', App, function(attr) {
        attr('override');
        this.func('navigate', (base, url) => {
            base();
            // TODO: via that npm package where nodejs urls can be faked as if they are called form client
        });  

        attr('async');
        this.func('auth', (resolve, reject, credentials) => {
            let validatedUser = new User(credentials.loginId, '(Dummy)', [], [], credentials.clientId);
            resolve(validatedUser);
        });
    });
});