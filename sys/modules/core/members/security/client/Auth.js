define([
    use('[Base]'),
    use('[User]'),
    use('[ClaimsChecker]')
], (Base, User, ClaimsChecker) => {
    /**
     * @class sys.core.security.client.Auth
     * @classdesc sys.core.security.client.Auth
     * @desc App authentication and authorization (client side)
     */    
    return Class('sys.core.security.client.Auth', Base, function(attr) {
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

        attr('fetch', '/auth', {
            method: 'POST',
            requestDataType: 'json',
            responseDataType: 'json',
            pre: (args) => { args.body = { credentials: Serializer.serialize(args.body) }; }
        });
        this.func('login', (resolve, reject, response) => {
            if (response.isError) {
                reject(response.error);
            } else {
                let loginResult = response.data;
                this.token = loginResult.token;
                this.user = Serializer.deserialize(User, loginResult.user);
                resolve(this.user);
            }
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