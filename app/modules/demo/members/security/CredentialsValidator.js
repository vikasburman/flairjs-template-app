define([
    use('[Base]'),
    use('[User]')
], (Base, User) => {
    /**
     * @class app.demo.security.CredentialsValidator
     * @classdesc app.demo.security.CredentialsValidator
     * @desc Validates credentials and returns validated user.
     */
    return Class('app.demo.security.CredentialsValidator', Base, function(attr) {
        attr('override');
        attr('singleton');
        this.func('constructor', (base) => {
            base();
            let db = new DiskDB(use(this.settings('data.demoDB')));
            this.users = db.getCollection('users');
            this.roles = db.getCollection('roles');
        });

        attr('async');
        this.func('validate', (resolve, reject, credentials) => {
            let userDocument = this.users.get({email: credentials.loginId});
            if (userDocument) {
                if (userDocument.pwdHash !== credentials.pwdHash) {
                    reject('Invalid password.');
                } else {
                    // merge access of all allocated roles of user
                    let roles = userDocument.roles,
                        access = [],
                        roleDocument = null;
                    for(let role of roles) {
                        roleDocument = this.roles.get({role: role});
                        if (roleDocument) {
                            for(let roleAccess of roleDocument.access) {
                                if (access.indexOf(roleAccess) === -1) {
                                    access.push(roleAccess);
                                }
                            }
                        }
                    }
                    let user = new User(credentials.loginId, userDocument.name, roles, access);
                    resolve(user);
                }
            } else {
                reject('Invalid user.');
            }
        });

        attr('private');
        this.prop('roles', null);

        attr('private');
        this.prop('users', null);
    });
});