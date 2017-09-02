define(() => {
    /**
     * @class sys.core.ErrorInfo
     * @classdesc sys.core.ErrorInfo
     * @desc Error information.
     */
    return Class('sys.core.ErrorInfo', function(attr) {
        attr('sealed');
        this.func('constructor', (code, desc, details, raw) => {
            if (typeof code === 'string') {
                this.desc = code;
            } else {
                this.raw = code;
                if (this.raw.status !== undefined && this.raw.statusText !== undefined) { 
                    this.code = raw.status;
                    this.desc = raw.statusText;
                }                  
            }
            if (details) { this.details = details; }
            if (!config.env.isProd && this.raw) {
                this.stack = this.raw.stack || this.raw.responseText;
            }
        });

        this.prop('isServerError', config.env.isServer);
        this.prop('code', config.env.isServer ? '500' : '5000');
        this.prop('desc', '');
        this.prop('details', '');
        this.prop('raw', null);
        this.prop('stack', '');
    });
});