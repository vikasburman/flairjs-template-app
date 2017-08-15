define([
    use('[Base]'),
    use('sys.core.ui.Component'),
    use('sys.core.ui.ComponentTypes'),
    use('sys.core.ui.Transition'),
    use('sys.core.bootwares.client.DataBinder')
], (Base, Component, ComponentTypes, DefaultTransition, DataBinder) => {
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
            base(ComponentTypes.View, shell, null);
            if (Transition) {
                this.transition = new Transition();
            } else {
                this.transition = new DefaultTransition();
            }
        });

        attr('protected');
        this.prop('request', null);

        attr('async');
        this.func('navigate', (resolve, reject, request) => {
            this.request = request;
            this.args = request.args;
            this.stage().then(() => {
                this.current = this._.pu; // store public reference
                resolve(this.current);
            }).catch((err) => {
                console.log(`Failed to navigate to ${request.url}. (${err || ''});`);
                reject(err);
            });
        });

        attr('private');
        attr('async');
        this.func('stage', (resolve, reject) => {
            if (this.current !== this) {
                // reset handlers
                this.env.set('handlers', {});

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
                //  set direction
                //  transtion this in and last out
                //  last afterHide
                //  last unbind
                //  last unmount
                //  this afterShow
                // OR (when last view does not exists)
                //  this beforeShow
                //  this mount
                //  this bind
                //  set direction
                //  transtion this in
                //  this afterShow
                // this focus
                this.parent._.pr.init().then(() => {
                    this._.pr.init().then(() => {
                        if (last) {
                            last._.cfas('beforeHide').then(() => {
                                current._.cfas('beforeShow').then(() => {
                                    current._.pr.mount();
                                    current._.pr.bind();
                                    this.setDirection();
                                    this.transition.in(current._.pr.$el, last._.pr.$el);
                                    last._.cfas('afterHide').then(() => {
                                        last._.pr.unbind();
                                        last._.pr.unmount();
                                        current._.cfas('afterShow').then(() => {
                                            current._.pr.focus();
                                            resolve();
                                        }).catch(reject);
                                    }).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                        } else {
                            current._.cfas('beforeShow').then(() => {
                                current._.pr.mount();
                                current._.pr.bind();
                                this.setDirection();
                                this.transition.in(current._.pr.$el);
                                current._.cfas('afterShow').then(() => {
                                    current._.pr.focus();
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

        attr('private');
        this.func('setDirection', () => {
            // set/reset rtl
            let currentRTL = document.body.getAttribute('dir');
            if (this.env.getLocale().rtl) {
                if (currentRTL !== 'rtl') {
                    document.body.setAttribute('dir', 'rtl');
                }
            } else {
                if (currentRTL === 'rtl') {
                    document.body.setAttribute('dir', '');
                }
            }
        });

        attr('protected');
        attr('sealed');
        this.func('mount', () => {
            // mount styles
            let mountStyles = (obj) => {
                if (obj._.pr.styles) {
                    obj._.pr.$style = document.createElement('style');
                    obj._.pr.$style.setAttribute('scoped', '');
                    obj._.pr.$style.appendChild(document.createTextNode(obj._.pr.styles));
                    obj._.pr.$el.prepend(obj._.pr.$style);
                }
            };

            // mount partials
            let mountPartial = (partial) => {
                partial._.pr.$host.append(partial._.pr.$el);
                mountStyles(partial);
                mountPartials(partial.partials);
            };
            let mountPartials = (partials) => {
                let partial = null;
                for(let po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];                
                        mountPartial(partial);
                    }
                }
            };

            // mount shell to stage
            this.parent._.pr.$host.append(this.parent._.pr.$el);
            mountStyles(this.parent);
            mountPartials(this.parent.partials);

            // mount view to shell container
            this._.pr.$host.append(this._.pr.$el);
            mountStyles(this);
            mountPartials(this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', () => {
            // unmount styles
            let unmountStyles = (obj) => {
                if (obj._.pr.$style) {
                    obj._.pr.$style.remove();
                }
            };

            // unmount partials
            let unmountPartial = (partial) => {
                unmountStyles(partial);
                partial._.pr.$el.remove();
                unmountPartials(partial.partials);
            };
            let unmountPartials = (partials) => {
                let partial = null;
                for(let po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];                
                        unmountPartial(partial);
                    }
                }
            };

            // unmount view from shell container
            unmountStyles(this);
            this._.pr.$el.remove();
            unmountPartials(this.partials);

            // unmount shell from stage
            unmountStyles(this.parent);
            this.parent._.pr.$el.remove();
            unmountPartials(this.parent.partials);
        });

        let _bindedView = null;
        attr('protected');
        attr('sealed');
        this.func('bind', () => {
            if (!_bindedView) {
                let getPartialBindings = (target, _obj) => {
                    let partial = null;
                    for(let po in _obj.partials) {
                        if (_obj.partials.hasOwnProperty(po)) {
                            partial = _obj.partials[po];
                            target[partial._.id] = partial._.bindable;
                            getPartialBindings(target, partial);
                        }
                    }
                };

                // get bindings
                let obj = {
                    partials: {},
                    shell: this.parent._.bindable,
                    view: this._.bindable
                };
                getPartialBindings(obj.partials, this.parent);
                getPartialBindings(obj.partials, this);

                // bind
                let binder = new DataBinder(); // its singleton, so no issue
                _bindedView = binder.bind(this.parent._.pr.$el, obj);
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

        attr('protected');
        attr('sealed');
        this.func('focus', () => {
            let $focus = this._.pr.$el.querySelector('[ag-focus');
            if ($focus) {
                $focus.focus();
            }
        });

        attr('protected');
        this.func('redirect', () => {
            if (this.request.query && this.request.query.returnUrl) {
                App.navigate(this.request.query.returnUrl, true);
            }
        });        

        this.data('title', '');
    });
});