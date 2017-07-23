define(() => {
    /**
     * @class sys.core.security.Credentials
     * @classdesc sys.core.security.Credentials
     * @desc Login credentials.
     */
    return Class('sys.core.security.Credentials', function(attr) {
        this.func('constructor', (loginId, pwdHash) => {
            this.loginId = loginId;
            this.pwdHash = pwdHash;
        });

        attr('serialize');
        this.prop('loginId', '');

        attr('serialize');
        this.prop('pwdHash', '');
    });
});