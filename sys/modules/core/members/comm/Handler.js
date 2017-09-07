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
        this.func('constructor', (base, className, funcName) => {
            base();
            this.className = className;
            this.funcName = funcName;
        });

        attr('private');
        this.prop('className', null);

        attr('private');
        this.prop('funcName', null);

        this.func('handle', (request) => {
            let errorText = (!this.env.isServer ? `Error handling: ${request.url}#${request.verb}` : `Error handling: ${request.url} \n%ERROR%`);
            include([use(this.className)]).then((Handler) => {
                let handler = new Handler();
                let handlerInfo = Reflector.get(handler);
                let funcInfo = handlerInfo.getMember(this.funcName);
                this.env.set('currentRequest', request);
                handler[this.funcName](request).then((result) => {
                    this.env.reset('currentRequest');
                }).catch((err) => {
                    this.env.reset('currentRequest');
                    xLog('error', errorText.replace('%ERROR%', this.errorText(err)));
                });   
            }).catch((err) => {
                xLog('error', errorText.replace('%ERROR%', this.errorText(err)));
            });
        });
    });
});