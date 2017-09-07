define([
    use('[ErrorInfo]')
], (ErrorInfo) => {
    /**
     * @class sys.core.Base
     * @classdesc sys.core.Base
     * @desc Base class for all classes.
     */
    return Class('sys.core.Base', function(attr) {
        this.func('constructor', this.noop);

        attr('protected');
        this.prop('env', config.env);

        let _assembly = '';
        attr('readonly');
        attr('protected');
        this.prop('assembly', () => {
            if (!_assembly) { 
                let parts = this._.name.split('.');
                if (parts.length > 1) {
                    _assembly = parts[0] + '.' + parts[1];
                }
            }
            return _assembly;
        });

        attr('protected');
        this.func('settings', (key, defaultValue = null) => {
            if (key.indexOf(':') !== -1) {
                return settings(key, defaultValue);
            } else if (this.assembly === '') {
                throw `assembly must be defined.`;
            } else {
                return settings(this.assembly + ':' + key, defaultValue);
            }
        });

        attr('protected');
        this.func('onError', (err) => {
            xLog('error', `Error in ${this._.name}. \n${this.errorText(err)}`);
        });

        attr('protected');
        this.func('errorText', (err) => {
            let error = new ErrorInfo(err),
                errText = error.getText();
            return errText;
        });
    });
});