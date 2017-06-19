define(() => {
    /**
     * @class sys.core.Base
     * @classdesc sys.core.Base
     * @desc Base class for all classes.
     */
    return Class('Base', function(attr) {
        attr('protected');
        this.prop('env', config.env);

        attr('protected');
        this.prop('assembly', '');

        attr('protected');
        this.func('settings', (key, defaultValue = null) => {
            if (key.indexOf(':') !== -1) {
                return settings(key, defaultValue);
            } else if (this.assembly === '') {
                throw `assembly namespace must be defined.`;
            } else {
                return settings(this.assembly + ':' + key, defaultValue);
            }
        });

        attr('protected');
        this.func('onError', (err) => {
            console.log(`Error in ${this.assembly + '.' + this._.name} (${err.toString()})`); 
            if (!config.env.isProd) { 
                console.log(`${err}`);
            }
        });
    });
});