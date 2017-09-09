define([
    use('[Base]'),
    use('app/core/libs/aes{.min}.js')
], (Base) => {
    /**
     * @class app.core.security.Crypt
     * @classdesc app.core.security.Crypt
     * @desc Crypt functions.
     */
    return Class('app.core.security.Crypt', Base, function(attr) {
        attr('override')
        attr('singleton');
        this.func('constructor', (base) => {
            base();
            this.secretKey = this.settings('crypt.secretKey', 'adfdef1d-ce1a-470d-a652-f466292acf85');
        });

        this.func('encrypt', (plainText, secretKey = '') => {
            return CryptoJS.AES.encrypt(plainText, secretKey || this.secretKey).toString();
        });
        this.func('decrypt', (encryptedText, secretKey = '') => {
            return CryptoJS.AES.decrypt(encryptedText, secretKey || this.secretKey).toString(CryptoJS.enc.Utf8);
        });

        attr('private');
        this.prop('secretKey', '');
    });
});