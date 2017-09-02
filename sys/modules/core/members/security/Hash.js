define([
    use('[Base]'),
    use('sys/core/libs/md5{.min}.js')
], (Base) => {
    /**
     * @class sys.core.security.Hash
     * @classdesc sys.core.security.Hash
     * @desc Hash creator.
     */
    return Class('sys.core.security.Hash', Base, function(attr) {
        attr('override')
        attr('singleton');
        this.func('constructor', (base) => {
            base();
        });

        this.func('get', (text) => {
            return CryptoJS.MD5(text).toString();
        });
    });
});