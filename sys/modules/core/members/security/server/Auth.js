define([
    use('[Base]'),
    use('[User]'),
    use('[ClaimsChecker]'),
    use('[Credentials]'),
    use('[CredentialsValidator]'),
    use('sys.core.security.server.JwtToken')
], (Base, User, ClaimsChecker, Credentials, CredentialsValidator, jwt) => {
    /**
     * @class sys.core.security.server.Auth
     * @classdesc sys.core.security.server.Auth
     * @desc App authentication and authorization (server side)
     */    
    return Class('sys.core.security.server.Auth', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });
        
        attr('async');
        this.func('validate', (resolve, reject, request) => {
            let token = request.getToken();
            if (token) {
                jwt.verify(token).then((serializedUser) => {
                    if (serializedUser) {
                        let user = Serializer.deserialize(User, serializedUser),
                            claimsChecker = new ClaimsChecker();
                        if (claimsChecker.check(request.claims, user.access)) {
                            request.user = user;
                            resolve();
                        } else {
                            reject('Unauthorized');
                        }
                    } else {
                        reject('Unauthorized user.');
                    }
                }).catch(reject);
            } else {
                reject('Authentication token is not available.');
            }
        });

        this.func('login', (request) => {
            if (request.isError) {
                request.response.send.error(request.error, request.errorMessage);
            } else {
                let credentials = Serializer.deserialize(Credentials, request.data.credentials || {}),
                    credentialsValidator = new CredentialsValidator();
                credentialsValidator(credentials).then((user) => {
                    if (user) {
                        let serializedUser = Serializer.serialize(user);
                        jwt.create(serializedUser).then((token) => {
                            if (token) {
                                request.response.send.json({token: token, user: serializedUser});
                            } else {
                                request.response.send.error(401, 'Failed to generate auth token.');
                            }
                        }).catch((err) => {
                            request.response.send.error(401, `Failed to generate auth token. (${err || ''})`);
                        });
                    } else {
                        request.response.send.error(401, 'User not found.');
                    }
                }).catch((err) => {
                    request.response.send.error(401, `Invalid user name or password. (${err || ''})`);
                });
            }
        });
    });
});