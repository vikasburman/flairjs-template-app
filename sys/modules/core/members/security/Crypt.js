define([
    use('[Base]'),
    use('sys/core/libs/aes{.min}.js'),
    use('sys/core/libs/md5{.min}.js')
], (Base) => {
    /**
     * @class sys.core.security.Crypt
     * @classdesc sys.core.security.Crypt
     * @desc Crypt functions.
     */
    return Class('sys.core.security.Crypt', Base, function(attr) {
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
        this.func('hash', (text) => {
            return CryptoJS.MD5(text).toString();
        });

        attr('private');
        this.prop('secretKey', '');
    });
});