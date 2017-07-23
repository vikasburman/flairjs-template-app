define([
    use('[Base]'),    
    use('[User]')
], (Base, User) => {
    /**
     * @class sys.core.security.CredentialsValidator
     * @classdesc sys.core.security.CredentialsValidator
     * @desc Validates credentials and returns validated user.
     */
    return Class('sys.core.security.CredentialsValidator', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });

        attr('async');
        this.func('validate', (resolve, reject, credentials) => {
            let validatedUser = new User(credentials.loginId, '(Dummy)', [], []);
            resolve(validatedUser);
        });
    });
});