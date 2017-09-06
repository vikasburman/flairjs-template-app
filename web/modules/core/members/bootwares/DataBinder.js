define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class web.core.bootwares.DataBinder
     * @classdesc web.core.bootwares.DataBinder
     * @desc Load client-side data binding configuration.
     */    
    return Class('web.core.bootwares.DataBinder', Base, [IBootware], function(attr) {
        attr('singleton');
        attr('override');
        this.func('constructor', (base) => {
            base();
        });

        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // setup shim for require
            let shimFor = { name: 'rivets', path: 'web/core/libs/rivets{.min}.js' },
                shimDeps = [{ name: 'sightglass', path: 'web/core/libs/sightglass{.min}.js' }];
            this.env.addShim(shimFor, shimDeps);

            // load rivets
            include([use('rivets')]).then((rivets) => {
                // set
                this.rivets = rivets;

                // configuration
                let rivetsConfig = this.settings('rivets.config', null);
                if (rivetsConfig) {
                    rivets.configure(rivetsConfig);
                }

                // custom binders
                let loadBinders = () => {
                    return new Promise((_resolve, _reject) => {
                        let items = this.settings('rivets.binders', null);
                        if (items) {
                            forAsync(items, (__resolve, __reject, item) => {
                                include([use(item)]).then((Binder) => {
                                    // create
                                    let obj = new Binder();

                                    // validate
                                    if (!obj.binderName) { throw `Binder name is not defined. (${obj._.name})`; }

                                    // define binder
                                    if (!rivets.binders[obj.binderName]) {
                                        if (!obj.isTwoWay) { // one-way binder
                                            rivets.binders[obj.binderName] = obj.routine;
                                        } else { // two-way binder
                                            rivets.binders[obj.binderName] = {
                                                bind: obj.bind,
                                                unbind: obj.unbind,
                                                routine: obj.routine, 
                                                getValue: obj.getValue,
                                                publishes: obj.publishes,
                                                block: obj.block
                                            };
                                        }                        
                                    }

                                    // done
                                    __resolve();
                                }).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // custom formatters 
                let loadFormatters = () => {
                    return new Promise((_resolve, _reject) => {
                        let items = this.settings('rivets.formatters', null);
                        if (items) {
                            forAsync(items, (__resolve, __reject, item) => {
                                include([use(item)]).then((Formatter) => {
                                    // create
                                    let obj = new Formatter();

                                    // validate
                                    if (!obj.formatterName) { throw `Formatter name is not defined. (${obj._.name})`; }

                                    // define formatter
                                    if (!rivets.formatters[obj.formatterName]) {
                                        if (!obj.isTwoWay) { // one-way formatter
                                            rivets.formatters[obj.formatterName] = obj.read;
                                        } else { // two-way formatter
                                            rivets.formatters[obj.formatterName] = {
                                                read: obj.read,
                                                publish: obj.publish
                                            };
                                        }                        
                                    }

                                    // done
                                    __resolve();
                                }).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // custom adapters
                let loadAdapters = () => {
                    return new Promise((_resolve, _reject) => {
                        let items = this.settings('rivets.adapters', null);
                        if (items) {
                            forAsync(items, (__resolve, __reject, item) => {
                                include([use(item)]).then((Adapter) => {
                                    // create
                                    let obj = new Adapter();

                                    // validate
                                    if (!obj.adapterName) { throw `Adapter name is not defined. (${obj._.name})`; }

                                    // define adapter
                                    if (!rivets.adapters[obj.adapterName]) {
                                        rivets.adapters[obj.adapterName] = {
                                            observe: obj.observe,
                                            unobserve: obj.unobserve,
                                            get: obj.get, 
                                            set: obj.set
                                        };
                                    }                         

                                    // done
                                    __resolve();
                                }).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };                

                // process
                loadBinders()
                    .then(loadFormatters)
                    .then(loadAdapters)
                    .then(resolve)
                    .catch(reject);
                // loadBinders().then(() => {
                //     loadFormatters().then(() => {
                //         loadAdapters().then(() => {
                //             resolve();
                //         }).catch(reject);
                //     }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);

        attr('private');
        this.prop('rivets', null);

        this.func('bind', ($el, obj) => {
            return rivets.bind($el, obj);
        });
        this.func('unbind', (bindedView) => {
            bindedView.unbind();
        });
    });
});