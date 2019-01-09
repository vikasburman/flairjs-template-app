define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.ValueValidator
     * @classdesc sys.core.data.ValueValidator
     * @desc Data value validator.
     */
    return Class('sys.core.data.ValueValidator', Base, function(attr) {
        attr('singleton');
        attr('override');
        this.func('constructor', (base) => {
            base();
        });

        this.func('validate', (dataValue, validator, ...validationCfg) => {
            let fn = null,
                result = null;
            if (typeof validator === 'function') {
                fn = validator;
            } else {
                fn = this[validator + 'Check']; // a private function with check type name suffixed with 'Check'
            }

            // validate
            try {
                fn(dataValue, ...validationCfg);
            } catch (err) {
                this.onError(err);
                result = err;
            }
            return result;
        });

        attr('private');
        this.func('nullCheck', (dataValue) => {
            if (dataValue === null) {
                throw 'Null values are not allowed.';
            }
        })
    });
});