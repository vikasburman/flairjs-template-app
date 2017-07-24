define([
    use('[Base]'),
    use('[Credentials]'),
    use('sys.core.security.Crypt')
], (Base, Credentials, Crypt) => {
    /**
     * @class web.demo.security.CredentialsCreator
     * @classdesc web.demo.security.CredentialsCreator
     * @desc Creates credentials object.
     */
    return Class('web.demo.security.CredentialsCreator', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });

        this.func('create', (loginId, pwd) => {
            let crypt = new Crypt(),
                pwdHash = crypt.hash(pwd);
            return new Credentials(loginId, pwdHash);
        });
    });
});