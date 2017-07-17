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
            let shell = new Shell(null, this);
            base('view', shell, null);
            if (Transition) {
                this.transition = new Transition();
            } else {
                this.transition = new DefaultTransition();
            }
        });

        this._.cfas = (asyncFuncName, isSkipPartials = false, ...args) => {
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
                this.parent._.cfas(asyncFuncName, isSkipPartials, ...args).then(() => {
                    if (typeof this[asyncFuncName] === 'function') {
                        this[asyncFuncName](...args).then(() => {
                            if (!isSkipPartials) {
                                callOnPartials(this).then(resolve).catch(reject);
                            } else {
                                resolve();
                            }
                        }).catch(reject);
                    } else {
                        resolve();
                    }
                }).catch(reject);
            });
        };
        this._.cfs = (syncFuncName, ...args) => {
          let callOnPartials = (obj) => {
                if (obj.partials) {
                    for(let partial of obj.partials) {
                        partial._.cfs(syncFuncName, ...args);
                    }
                }
            };

            // cumulative function call (sync)
            this.parent._.cfs(syncFuncName, ...args);
            if (typeof this[syncFuncName] === 'function') {
                this[syncFuncName](...args);
            }
            callOnPartials(this);
        };    

        attr('protected');
        this.prop('request', null);

        // this must be decorated with 'endpoint' attribute after overriding
        // in every derived class, for routing to work and access control of view to kick-in
        attr('async');
        this.func('navigate', (resolve, reject, request) => {
            if (request) {
                this.request = request;
                this.args = request.args;
                this.stage().then(() => {
                    this.current = this._.public; // store public reference
                    resolve();
                }).catch(reject);
            } else {
                reject('request not defined.');
            }
        });

        attr('private');
        attr('async');
        this.func('stage', (resolve, reject) => {
            if (this.current !== this) {
                let last = this.current,
                    current = this;
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
                // this focus
                this.parent._.init().then(() => {
                    this._.init().then(() => {
                        if (last) {
                            last._.cfas('beforeHide').then(() => {
                                this._.cfas('beforeShow').then(() => {
                                    this._.cfs('mount');
                                    this._.cfs('bind');
                                    this.transition.in(this, last);
                                    last._.cfas('afterHide').then(() => {
                                        last._.cfs('unbind');
                                        last._.cfs('unmount');
                                        this._.cfas('afterShow').then(() => {
                                            this._.cfs('focus');
                                            resolve();
                                        }).catch(reject);
                                    }).catch(reject);
                                })
                            }).catch(reject);
                        } else {
                            this._.cfas('beforeShow').then(() => {
                                this._.cfs('mount');
                                this._.cfs('bind');
                                this.transition.in(this);
                                this._.cfas('afterShow').then(() => {
                                    this._.cfs('focus');
                                    resolve();
                                }).catch(reject);
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

        attr('protected');
        attr('sealed');
        this.func('mount', () => {
            // mount styles
            let mountStyles = (obj) => {
                if (obj._.styles) {
                    obj._.$style = document.createElement('style');
                    obj._.$style.setAttribute('scoped', '');
                    obj._.$style.appendChild(document.createTextNode(obj._.styles));
                    obj._.$el.prepend(obj._.$style);
                }
            };

            // mount partials
            let mountPartial = (partial) => {
                partial._.$host.append(partial._.$el);
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
            this.parent._.$host.append(this.parent._.$el);
            mountStyles(this.parent);
            mountPartials(this.parent.partials);

            // mount view to shell container
            this._.$host.append(this._.$el);
            mountStyles(this);
            mountPartials(this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', () => {
            // unmount styles
            let unmountStyles = (obj) => {
                if (obj._.$style) {
                    obj._.$style.remove();
                }
            };

            // unmount partials
            let unmountPartial = (partial) => {
                    unmountStyles(partial);
                    partial._.$el.remove();
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
            this._.$el.remove();
            unmountPartials(this.partials);

            // unmount shell from stage
            unmountStyles(this.parent);
            this.parent._.$el.remove();
            unmountPartials(this.parent.partials);
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
                    shell: this.parent,
                    view: this._.public // give public interface
                };
                getPartialBindings(obj.partials, this.parent);
                getPartialBindings(obj.partials, this);

                // bind
                let binder = new DataBinder(); // its singleton, so no issue
                _bindedView = binder.bind(this.parent._.$el, obj);
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

        attr('private');
        this.func('focus', () => {
            let $focus = this._.$el.querySelector('[ag-focus');
            if ($focus) {
                $focus.focus();
            }
        });

        this.prop('title', '');
    });
});