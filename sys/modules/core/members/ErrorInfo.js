define(() => {
    /**
     * @class sys.core.ErrorInfo
     * @classdesc sys.core.ErrorInfo
     * @desc Error information.
     */
    return Class('sys.core.ErrorInfo', function(attr) {
        attr('sealed');
        this.func('constructor', (code, desc, details, raw) => {
            this.isServerError = config.env.isServer;
            this.code = (config.env.isServer ? '500' : '5000');
            if (code._ && code._.name === this._.name) { // ErrorInfo class
                this.code = code.code;
                this.desc = code.desc;
                this.details = code.details;
                this.raw = code.raw;
                this.stack = code.stack || console.trace();
            } else if (code && desc && details && raw) {
                this.code = code;
                this.desc = desc;
                this.details = details;
                this.raw = raw;
                this.stack = console.trace();
            } else if (typeof code === 'string') { // error string
                this.desc = code;
                this.details = '';
                this.raw = '';
                this.stack = console.trace();
            } else if (typeof code === 'number') {
                this.code = code.toString();
                this.desc = desc || code.toString();
                this.details = details || '';
                this.raw = raw || '';
                this.stack = console.trace();
            } else { // some other error object
                this.raw = code;
                this.code = code.status || code.code || this.code;
                this.desc = code.statusText || code.desc || code.toString() || '';
                this.details = code.details || '';
                this.stack = code.stack || code.responseText || console.trace();
            }
            if (config.env.isProd && !config.env.isServer) { this.stack = ''; }
        });

        this.prop('isServerError');
        this.prop('code');
        this.prop('desc');
        this.prop('details');
        this.prop('raw');
        this.prop('stack');

        this.func('getText', () => {
            return `Error: [${this.code}] ${this.desc} ${(this.details ? '\n' + this.details : '')} ${(this.stack ? '\n' + this.stack : '')}`;
        });
    });
});