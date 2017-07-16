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

        attr('async');
        this.func('handle', (resolve, reject, request) => {
            include([use(this.className)]).then((Handler) => {
                let handler = new Handler(),
                    handlerInfo = Reflector.get(handler),
                    funcInfo = handlerInfo.getMember(this.funcName);
                    if (!funcInfo || funcInfo.getMemberType() !== 'func' || !funcInfo.hasAttribute('endpoint')) {
                        throw (this.env.isServer ? `Invalid handler endpoint for: ${request.url}#${request.verb}` : `Invalid handler endpoint for: ${request.url}`);
                    } 
                handler[this.funcName](request).then(resolve).catch(reject);            
            }).catch(reject);
        });
    });
});