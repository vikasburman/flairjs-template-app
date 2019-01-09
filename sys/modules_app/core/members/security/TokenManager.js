define([
    use('[Base]'),
    use('jsonwebtoken')
], (Base, jwt) => {
    /**
     * @class app.core.security.TokenManager
     * @classdesc app.core.security.TokenManager
     * @desc Token manager (JWT).
     */    
    return Class('app.core.security.TokenManager', Base, function(attr) {
        attr('async');
        this.func('create', (resolve, reject, payload) => {
            let secret = this.settings('security.jwt.secretKey', 'adfdef1d-ce1a-470d-a652-f466292acf85'),
                expiresInMinutes = this.settings('security.jwt.expiresInMinutes', 30),
                token = jwt.sign(payload, secret, {
                    expiresIn: (expiresInMinutes * 60)
                });
            resolve(token);
        });

        attr('async');
        this.func('verify', (token) => {
            let secret = this.settings('security.jwt.secretKey', 'adfdef1d-ce1a-470d-a652-f466292acf85');
            jwt.verify(token, secret, (err, payload) => {
                if (!err) { 
                    resolve(payload);
                } else {
                    reject(err);
                }
            });
        });
    });
});