define(() => {
    /**
     * @class sys.core.security.Credentials
     * @classdesc sys.core.security.Credentials
     * @desc Login credentials.
     */
    return Structure('sys.core.security.Credentials', function(loginId, pwd, clientId = '') {
        this.clientId = clientId;
        this.loginId = loginId;
        this.pwd = pwd;
    });
});