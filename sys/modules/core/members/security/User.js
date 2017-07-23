define(() => {
    /**
     * @class sys.core.security.User
     * @classdesc sys.core.security.User
     * @desc User information.
     */
    return Class('sys.core.security.User', function(attr) {
        this.func('constructor', (loginId, name, roles, claims) => {
            this.loginId = loginId;
            this.name = name;
            this.roles = roles;
            this.claims = claims;
        });

        attr('serialize');
        this.prop('loginId', '');

        attr('serialize');
        this.prop('name', '');

        attr('serialize');
        this.prop('roles', []);

        attr('serialize');
        this.prop('access', []);
    });
});