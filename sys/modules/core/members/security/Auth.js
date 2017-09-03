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

        attr('service', '/auth', {
            method: 'POST',
            requestDataType: 'application/json',
            responseDataType: 'json',
            pre: (args) => { args.body = { credentials: args.body }; }
        });
        this.func('login', (service, resolve, reject, loginId = '', pwd = '', clientId = '') => {
            let credentials = App.auth(loginId, pwd, clientId);
            service({credentials : credentials}).then((response) => {
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
        this.prop('token', null);

        attr('private');
        attr('session');
        this.prop('user', null);
    });
});