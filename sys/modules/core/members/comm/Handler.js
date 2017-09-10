define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.comm.Handler
     * @classdesc sys.core.comm.Handler
     * @desc Handler information.
     */
    return Class('sys.core.comm.Handler', Base, function(attr) {
        attr('override');
        attr('sealed');
        this.func('constructor', (base, className, funcName, params) => {
            base();
            this.className = className;
            this.funcName = funcName;
            this.params = params;
        });

        attr('private');
        this.prop('className');

        attr('private');
        this.prop('funcName');

        attr('private');
        this.prop('params');

        this.func('handle', (request) => {
            let errorText = (!this.env.isServer ? `Error handling: ${request.url}#${request.verb}.` : `Error handling: ${request.url}.`);
            include([use(this.className)]).then((Handler) => {
                let handler = new Handler(),
                    fn = getNestedKeyValue(handler, this.funcName, null);
                this.env.set('currentRequest', request);
                if (fn) {
                    let args = [request]; args.push(...this.params);
                    fn(...args).then((result) => {
                        this.env.reset('currentRequest');
                    }).catch((err) => {
                        this.env.reset('currentRequest');
                        this.onError(err, errorText);
                    });   
                } else {
                    this.onError(`Invalid service handler. (${this.className}.${this.funcName})`, errorText);
                }
            }).catch((err) => {
                this.onError(err, errorText);
            });
        });
    });
});