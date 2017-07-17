define([
    use('sys.core.ui.Component')
], (Component) => {
    /**
     * @class sys.core.ui.Partial
     * @classdesc sys.core.ui.Partial
     * @desc Partial base class.
     */    
    return Class('sys.core.ui.Partial', Component, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, parent, args) => {
            base('partial', parent, args);
        });

        this._.cfas = (asyncFuncName, ...args) => {
            return new Promise((resolve, reject) => {
                let callOnPartials = (obj) => {
                    return new Promise((_resolve, _reject) => {
                            if (obj.partials) {
                                forAsync(obj.partials, (__resolve, __reject, partial) => {
                                    partial._.cfas(asyncFuncName, ...args).then(__resolve).catch(__reject);
                                }).then(_resolve).catch(_reject);
                            } else {
                                _resolve();
                            }
                    });
                };

                // cumulative function call (async)
                if (typeof this[asyncFuncName] === 'function') {
                    this[asyncFuncName](...args).then(() => {
                        callOnPartials(this).then(resolve).catch(reject);
                    }).catch(reject);
                } else {
                    resolve();
                }
            });
        };
        this._.cfs = (syncFuncName, ...args) => {
          let callOnPartials = (obj) => {
                if (obj.partials) {
                    for(let partial of obj.partials) {
                        partial.cfs(syncFuncName, ...args);
                    }
                }
            };

            // cumulative function call (sync)
            if (typeof this[syncFuncName] === 'function') {
                this[syncFuncName](...args);
            }
            callOnPartials(this);
        };         
   });
});