define([
    use('[Base]'),    
    use('[User]'),
    use('[Credentials]')
], (Base, User, Credentials) => {
    /**
     * @class sys.core.security.CredentialsCreator
     * @classdesc sys.core.security.CredentialsCreator
     * @desc Creates credentials object.
     */
    return Class('sys.core.security.CredentialsCreator', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });

        this.func('create', (loginId, pwd, clientId = '') => {
            return new Credentials(loginId, pwd, clientId);
        });
    });
});