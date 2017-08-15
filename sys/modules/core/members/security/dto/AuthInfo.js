define(() => {
    /**
     * @class sys.core.security.dto.AuthInfo
     * @classdesc sys.core.security.dto.AuthInfo
     * @desc User auth information.
     */
    return Structure('sys.core.security.dto.AuthInfo', function(token, user) {
        this.token = token;
        this.user = user;
    });
});