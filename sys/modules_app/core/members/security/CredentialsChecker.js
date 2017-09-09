define([
    use('[User]')    
], (User) => {
    /**
     * @class app.core.security.CredentialsChecker
     * @classdesc app.core.security.CredentialsChecker
     * @desc Check credentials and returns associated user.
     */
    return Class('app.core.security.CredentialsChecker', function(attr) {
        attr('async');
        this.func('check', (resolve, reject, credentials) => {
            let validatedUser = new User(credentials.loginId, '(Dummy)', [], [], credentials.clientId);
            resolve(validatedUser);
        });
    });
});