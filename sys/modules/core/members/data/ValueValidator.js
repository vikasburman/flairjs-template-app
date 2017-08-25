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
                xLog('error', `${this.errorText(err)}`);
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