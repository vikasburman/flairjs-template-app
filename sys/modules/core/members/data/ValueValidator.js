define(() => {
    /**
     * @class sys.core.data.ValueValidator
     * @classdesc sys.core.data.ValueValidator
     * @desc Data value validator.
     */
    return Class('sys.core.data.ValueValidator', function(attr) {
        attr('singleton');
        this.func('constructor', () => {
        });

        this.func('validate', (dataValue, validationType, ...args) => {
            // TODO: one validation type can be 'custom' which takes a fn and pass call to that fn with other parameteres
        });
    });
});