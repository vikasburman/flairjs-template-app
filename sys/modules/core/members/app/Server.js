define([
    use('sys.core.app.App'),
    use('[User]')
], (App, User) => {
    /**
     * @class sys.core.app.Server
     * @classdesc sys.core.app.Server
     * @desc Starts server application.
     */         
    return Class('sys.core.app.Server', App, function(attr) {
        attr('async');
        this.func('auth', (resolve, reject, credentials) => {
            let validatedUser = new User(credentials.loginId, '(Dummy)', [], [], credentials.clientId);
            resolve(validatedUser);
        });
    });
});