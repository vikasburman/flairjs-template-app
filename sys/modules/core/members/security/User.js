define(() => {
    /**
     * @class sys.core.security.User
     * @classdesc sys.core.security.User
     * @desc User information.
     */
    return Structure('sys.core.security.User', function(loginId, name, roles, access, clientId = '') {
        this.clientId = clientId;
        this.loginId = loginId;
        this.name = name;
        this.roles = roles;
        this.access = access;
    });
});