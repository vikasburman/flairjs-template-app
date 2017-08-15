define(() => {
    /**
     * @class sys.core.security.dto.User
     * @classdesc sys.core.security.dto.User
     * @desc User information.
     */
    return Structure('sys.core.security.dto.User', function(loginId, name, roles, access, clientId = '') {
        this.clientId = clientId;
        this.loginId = loginId;
        this.name = name;
        this.roles = roles;
        this.access = access;
    });
});