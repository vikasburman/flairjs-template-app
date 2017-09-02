define([
    use('sys.core.app.App'),
    use('[User]')
], (App, User) => {
    /**
     * @class app.core.app.ServerApp
     * @classdesc app.core.app.ServerApp
     * @desc Starts server application.
     */         
    return Class('app.core.app.ServerApp', App, function(attr) {
        attr('async');
        this.func('auth', (resolve, reject, credentials) => {
            let validatedUser = new User(credentials.loginId, '(Dummy)', [], [], credentials.clientId);
            resolve(validatedUser);
        });
    });
});