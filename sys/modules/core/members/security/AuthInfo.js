define(() => {
    /**
     * @class sys.core.security.AuthInfo
     * @classdesc sys.core.security.AuthInfo
     * @desc User auth information.
     */
    return Structure('sys.core.security.AuthInfo', function(token, user) {
        this.token = token;
        this.user = user;
    });
});