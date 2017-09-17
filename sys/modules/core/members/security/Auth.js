define([
    use('[Base]'),
    use('[User]'),
    use('[ClaimsChecker]')
], (Base, User, ClaimsChecker) => {
    /**
     * @class sys.core.security.Auth
     * @classdesc sys.core.security.Auth
     * @desc App authentication and authorization (client side)
     */    
    return Class('sys.core.security.Auth', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });
        
        attr('async');
        this.func('validate', (resolve, reject, request) => {
            let token = this.token,
                user = this.user;
            if (token) {
                if (user) {
                    let claimsChecker = new ClaimsChecker();
                    if (claimsChecker.check(request.claims, user.access)) {
                        request.user = user;
                        resolve();
                    } else {
                        reject('Unauthorized.');
                    }
                } else {
                    reject('Unauthorized user.');
                }
            } else {
                reject('Authentication token is not available.');
            }           
        });

        attr('request', 'post->/auth');
        this.func('login', (request, resolve, reject, loginId = '', pwd = '', clientId = '') => {
            // TODO: check if all three parameterss are coming - I Doubt with new changes in
            // attribute, that all paras are coming... may need some change in attribute
            let credentials = App.auth(loginId, pwd, clientId);
            request({credentials : credentials}).then((response) => {
                if (response.isError) {
                    reject(response.error);
                } else {
                    let loginResult = response.data;
                    this.token = loginResult.token;
                    this.user = loginResult.user;
                    resolve(this.user);
                }
            }).catch(reject);
        });

        this.func('logout', () => {
            this.token = null;
            this.user = null;
        });

        this.prop('isLoggedIn', () => { return ((this.token && this.user) ? true : false); });
        this.func('getToken', () => { return this.token; });
        this.func('getTokenHeader', () => { return { Authorization: 'Bearer ' + this.token }; });
        this.func('getUser', () => { return this.user; });

        attr('private');
        attr('session');
        this.prop('token');

        attr('private');
        attr('session');
        this.prop('user');
    });
});