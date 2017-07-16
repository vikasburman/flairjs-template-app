define([
    use('[Base]'),
    use('sys.core.ui.Component'),
    use('sys.core.ui.Transition'),
    use('sys.core.bootwares.client.DataBinder')
], (Base, Component, DefaultTransition, DataBinder) => {
    /**
     * @class sys.core.ui.View
     * @classdesc sys.core.ui.View
     * @desc View base class.
     */    
    return Class('sys.core.ui.View', Component, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, Shell, Transition) => {
            this.shell = new Shell(null, this);
            base('view', this.shell, null);
            if (Transition) {
                this.transition = new Transition();
            } else {
                this.transition = new DefaultTransition();
            }
        });

        attr('protected');
        this.prop('shell', null);

        attr('protected');
        this.prop('request', null);

        // this must be decorated with 'endpoint' attribute after overriding
        // in every derived class, for routing to work and access control of view to kick-in
        attr('async');
        this.func('navigate', (resolve, reject, request) => {
            if (request) {
                this.request = request;
                this.args = request.args;
                this.stage().then(resolve).catch(reject);
            } else {
                reject('request not defined.');
            }
        });

        attr('async');
        attr('sealed');
        this.func('back', (resolve, reject) => {
            if (this.current === this) {
                // sequence
                //  this beforeHide
                // (partials are processed along with shell/view)
                // EITHER (if last view exists)
                //  last beforeShow
                //  last mount
                //  last bind
                //  transtion last in and this out
                //  this afterHide
                //  this unbind
                //  this unmount
                //  last afterShow
                // OR (when last view does not exists)
                //  transtion this out
                //  this afterHide
                //  this unbind
                //  this unmount
                this.cfas('beforeHide').then(() => {
                    let last = this.last;
                    this.current = last;
                    this.last = null;
                    if (last) {
                        last.cfas('beforeShow').then(() => {
                            last.cfs('mount');
                            last.cfs('bind');
                            this.transition.out(this, last);
                            this.cfas('afterHide').then(() => {
                                this.cfs('unbind');
                                this.cfs('unmount');
                                last.cfas('afterShow').then(resolve).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    } else {
                        this.transition.out(this);
                        this.cfas('afterHide').then(() => {
                            this.cfs('unbind');
                            this.cfs('unmount');
                            resolve();
                        }).catch(reject);
                    }
                }).catch(reject);
            }
        });

        attr('private');
        attr('async');
        this.func('stage', (resolve, reject) => {
            if (this.current !== this) {
                this.last = this.current;
                this.current = this;
                let last = this.last;
                // sequence
                // (partials are processed along with shell/view)
                // this init
                // EITHER (if last view exists)
                //  last beforeHide
                //  this beforeShow
                //  this mount
                //  this bind
                //  transtion this in and last out
                //  last afterHide
                //  last unbind
                //  last unmount
                //  this afterShow
                // OR (when last view does not exists)
                //  this beforeShow
                //  this mount
                //  this bind
                //  transtion this in
                //  this afterShow
                this.shell.init().then(() => {
                    this.init().then(() => {
                        if (last) {
                            last.cfas('beforeHide').then(() => {
                                this.cfas('beforeShow').then(() => {
                                    this.cfs('mount');
                                    this.cfs('bind');
                                    this.transition.in(this, last);
                                    last.cfas('afterHide').then(() => {
                                        last.cfs('unbind');
                                        last.cfs('unmount');
                                        this.cfas('afterShow').then(resolve).catch(reject);
                                    }).catch(reject);
                                })
                            }).catch(reject);
                        } else {
                            this.cfas('beforeShow').then(() => {
                                this.cfs('mount');
                                this.cfs('bind');
                                this.transition.in(this);
                                this.cfas('afterShow').then(resolve).catch(reject);
                            }).catch(reject);
                        }
                    }).catch(reject);
                }).catch(reject);
            } else {
                resolve();
            }
        });

        attr('private');
        this.prop('transition', null);

        attr('private');
        this.prop('current', 
            () => { return this.env.get('currentView', null); }, 
            (view) => { this.env.set('currentView', view); 
        });

        attr('private');
        this.prop('last', null);

        attr('protected');
        attr('sealed');
        this.func('mount', () => {
            // mount styles
            let mountStyles = (obj) => {
                if (obj.styles) {
                    obj.$style = document.createElement('style');
                    obj.$style.setAttribute('scoped', '');
                    obj.$style.appendChild(document.createTextNode(obj.styles));
                    obj.$el.prepend(obj.$style);
                }
            };

            // mount partials
            let mountPartial = (partial) => {
                partial.$host.append(partial.$el);
                mountStyles(partial);
                mountPartials(partial.partials);
            };
            let mountPartials = (partials) => {
                if (partials) {
                    for(let partial of partials) {
                        mountPartial(partial);
                    }
                }
            };

            // mount shell to stage
            this.shell.$host.append(this.shell.$el);
            mountStyles(this.shell);
            mountPartials(this.shell.partials);

            // mount view to shell container
            this.$host.append(this.$el);
            mountStyles(this);
            mountPartials(this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', () => {
            if (_isMounted) {
                _isMounted = false;
                
                // unmount styles
                let unmountStyles = (obj) => {
                    if (obj.$style) {
                        obj.$style.remove();
                    }
                };

                // unmount partials
                let unmountPartial = (partial) => {
                     unmountStyles(partial);
                     partial.$el.remove();
                     unmountPartials(partial.partials);
                };
                let unmountPartials = (partials) => {
                    if (partials) {
                        for(let partial of partials) {
                            unmountPartial(partial);
                        }
                    }
                };

                // unmount view from shell container
                unmountStyles(this);
                this.$el.remove();
                unmountPartials(this.partials);

                // unmount shell from stage
                unmountStyles(this.shell);
                this.shell.$el.remove();
                unmountPartials(this.shell.partials);
            }
        });

        let _bindedView = null;
        attr('protected');
        attr('sealed');
        this.func('bind', () => {
            if (!_bindedView) {
                let getPartialBindings = (target, _obj) => {
                    if (_obj.partials) {
                        for(let partial of _obj.partials) {
                            target[partial._.id] = partial;
                            getPartialBindings(target, partial);
                        }
                    }
                };

                // get bindings
                let obj = {
                    partials: {},
                    shell: this.shell,
                    view: this
                };
                getPartialBindings(obj.partials, this.shell);
                getPartialBindings(obj.partials, this);

                // bind
                let binder = new DataBinder(); // its singleton, so no issue
                _bindedView = binder.bind(this.shell.$el, obj);
            }
        });

        attr('protected');
        attr('sealed');
        this.func('unbind', () => {
            if (_bindedView) {
                let binder = new DataBinder(); // its singleton, so no issue
                binder.unbind(_bindedView);
                _bindedView = null;
            }
        });

        attr('async');
        this.func('cfas', (resolve, reject, asyncFuncName, ...args) => {
          let callOnPartials = (obj) => {
              return new Promise((_resolve, _reject) => {
                    if (obj.partials) {
                        forAsync(obj.partials, (__resolve, __reject, partial) => {
                            partial.cfas(asyncFuncName, ...args).then(__resolve).catch(__reject);
                        }).then(_resolve).catch(_reject);
                    } else {
                        _resolve();
                    }
              });
            };

            // cumulative function call (async)
            this.parent.cfas(asyncFuncName, ...args).then(() => {
                if (typeof this[asyncFuncName] === 'function') {
                    this[asyncFuncName](...args).then(() => {
                        callOnPartials(this).then(resolve).catch(reject);
                    }).catch(reject);
                } else {
                    resolve();
                }
            }).catch(reject);
        });

        this.func('cfs', (syncFuncName, ...args) => {
          let callOnPartials = (obj) => {
                if (obj.partials) {
                    for(let partial of obj.partials) {
                        partial.cfs(syncFuncName, ...args);
                    }
                }
            };

            // cumulative function call (sync)
            this.parent.cfs(syncFuncName, ...args);
            if (typeof this[syncFuncName] === 'function') {
                this[syncFuncName](...args);
            }
            callOnPartials(this);
        });         

        this.prop('title', '');
    });
});