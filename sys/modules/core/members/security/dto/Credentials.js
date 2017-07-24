define(() => {
    /**
     * @class sys.core.security.dto.Credentials
     * @classdesc sys.core.security.dto.Credentials
     * @desc Login credentials.
     */
    return Structure('sys.core.security.dto.Credentials', function(loginId, pwdHash) {
        this.loginId = loginId;
        this.pwdHash = pwdHash;
    });
});