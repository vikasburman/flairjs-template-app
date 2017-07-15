define([
    use('[Base]'),
    use('sys.core.ui.Component'),
    use('sys.core.ui.Transition'),
    use('sys/core/libs/rivets{.min}.js')
], (Base, CompositeComponent, DefaultTransition, rivets) => {
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

        attr('readonly');
        this.prop('shell', null);

        // this must be decorated with 'endpoint' attribute after overriding
        // in every derived class, for routing to work and access control of views to kick-in
        this.func('navigate', (args) => {
            this.args = args;
            this.push();
        });

        attr('async');
        attr('sealed');
        this.func('back', (resolve, reject) => {
            if (this.current === this) {
                this.beforeHide().then(() => {
                    let last = this.last;
                    this.current = null;
                    this.last = null;
                    if (last) {
                        last.beforeShow().then(() => {
                            last.bind();
                            this.transition.out(this, last);
                            this.afterHide().then(() => {
                                this.unbind();
                                this.unmount();
                                last.afterShow().then(resolve).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    } else {
                        this.transition.out(this);
                        this.afterHide().then(() => {
                            this.unbind();
                            this.unmount();
                            resolve();
                        }).catch(reject);
                    }
                }).catch(reject);
            }
        });

        attr('private');
        attr('async');
        this.func('push', (resolve, reject) => {
            if (this.current !== this) {
                this.last = this.current;
                this.current = this;
                let last = this.last;
                this.mount();
                if (last) {
                    last.beforeHide().then(() => {
                        this.beforeShow().then(() => {
                            this.bind();
                            this.transition.in(this, last);
                            last.afterHide().then(() => {
                                last.unbind();
                                last.unmount();
                                this.afterShow().then(resolve).catch(reject);
                            }).catch(reject);
                        })
                    }).catch(reject);
                } else {
                    this.beforeShow().then(() => {
                        this.bind();
                        this.transition.in(this);
                        this.afterShow().then(resolve).catch(reject);
                    }).catch(reject);
                }
            }
        });

        attr('private');
        this.prop('transition', null);

        attr('static');
        this.prop('current', null);

        attr('static');
        this.prop('last', null);

        let _isMounted = false;
        attr('sealed');
        this.func('mount', () => {
            if (!_isMounted) {
                _isMounted = true;
                
                // mount partials
                let mountPartial = (partial) => {
                     partial.$host.append(partial.$el);
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
                mountPartials(this.shell.partials);

                // mount view to shell container
                this.$host.append(this.$el);
                mountPartials(this.partials);
            }
        });

        attr('sealed');
        this.func('unmount', () => {
            if (_isMounted) {
                _isMounted = false;
                
                // unmount partials
                let unmountPartial = (partial) => {
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
                this.$el.remove();
                unmountPartials(this.partials);

                // unmount shell from stage
                this.shell.$el.remove();
                unmountPartials(this.shell.partials);
            }
        });

        let _bindedView = null;
        attr('sealed');
        this.func('bind', () => {
            if (!_bindedView) {
                // build bindable object
                let obj = {};
                let getData = (_obj) => {
                    let items = {},
                        refl = Reflector.get(_obj),
                        members = refl.getMembers().prop('data'); // all props having 'data' attribute applied
                    for(let member of members) {
                        Object.defineProperty(items, member, {
                            __proto__: null,
                            configurable: true,
                            enumerable: true,
                            get: () => { return _obj[member]; },
                            set: (value) => {
                                _obj[member] = value;
                            }                            
                        });
                    }
                };
                let getHandlers = (_obj) => {
                    let items = {},
                        refl = Reflector.get(_obj),
                        members = refl.getMembers().func('handler'); // all functions having 'handler' attribute applied
                    for(let member of members) {
                        items[member] = _obj[member];
                    }
                };
                let getBindings = (target, _obj) => {
                    target.data = getData(_obj);
                    target.handlers = getHandlers(_obj);
                };
                let getPartialBindings = (target, _obj) => {
                    if (_obj.partials) {
                        for(let partial of _obj.partials) {
                            target[partial.id] = {
                                data: getData(partial),
                                handlers: getHandlers(partial)
                            };
                        }
                    }
                };

                // get bindings
                getBindings(obj.shell, this.shell);
                getPartialBindings(obj.partials, this.shell);
                getBindings(obj.view, this);
                getPartialBindings(obj.partials, this);

                // bind
                _bindedView= rivets.bind(this.shell.$el, obj);
            }
        });

        attr('sealed');
        this.func('unbind', () => {
            if (_bindedView) {
                _bindedView.unbind();
                _bindedView = null;
            }
        });

        this.prop('title', '');
    });
});