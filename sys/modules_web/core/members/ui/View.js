define([
    use('[Component]'),
    use('[ComponentTypes]'),
    use('[Transition]'),
    use('[DataBinder]')
], (Component, ComponentTypes, DefaultTransition, DataBinder) => {
    /**
     * @class web.core.ui.View
     * @classdesc web.core.ui.View
     * @desc View base class.
     */    
    return Class('web.core.ui.View', Component, function(attr) {
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
                this.current = as(this, 'public'); // store public reference
                document.title = this.data.title + ' - ' + App.info.title
                resolve(this.current);
            }).catch((err) => {
                this.onError(err, `Failed to navigate to ${request.url}.`);
                reject(err);
            });
        });

        attr('private');
        attr('async');
        this.func('stage', (resolve, reject) => {
            if (this.current !== this) {
                xLog('debug', `${this._.name}.stage (start)`);
                
                // reset handlers
                this.env.set('handlers', {});

                let last = this.current,
                    current = this,
                    protectedRef = as(this, 'protected'),
                    currentProtectedRef = as(current, 'protected'),
                    lastProtectedRef = null,
                    parentProtectedRef = as(this.parent, 'protected');
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
                xLog('debug', `  ${parentProtectedRef._.name}.init (start)`);
                parentProtectedRef.init().then(() => {
                    xLog('debug', `  ${parentProtectedRef._.name}.init (done)`);
                    xLog('debug', `  ${protectedRef._.name}.init (start)`);
                    protectedRef.init().then(() => {
                        xLog('debug', `  ${protectedRef._.name}.init (done)`);
                        if (last) {
                            lastProtectedRef = as(last, 'protected')
                            xLog('debug', `  ${lastProtectedRef._.name}.beforeHide (start)`);
                            last._.cfas('beforeHide').then(() => {
                                xLog('debug', `  ${lastProtectedRef._.name}.beforeHide (done)`);
                                xLog('debug', `  ${current._.name}.beforeShow (start)`);
                                current._.cfas('beforeShow').then(() => {
                                    currentProtectedRef.mount();
                                    currentProtectedRef.bind();
                                    this.setDirection();
                                    xLog('debug', `  ${current._.name}.beforeShow (done)`);
                                    this.transition.in(currentProtectedRef.$el, lastProtectedRef.$el);
                                    xLog('debug', `  - ${lastProtectedRef._.name} is hidden`);
                                    xLog('debug', `  - ${currentProtectedRef._.name} is visible`);
                                    xLog('debug', `  ${lastProtectedRef._.name}.afterHide (start)`);
                                    last._.cfas('afterHide').then(() => {
                                        lastProtectedRef.unbind();
                                        lastProtectedRef.unmount();
                                        xLog('debug', `  ${lastProtectedRef._.name}.afterHide (done)`);
                                        xLog('debug', `  ${current._.name}.afterShow (start)`);
                                        current._.cfas('afterShow').then(() => {
                                            currentProtectedRef.focus();
                                            xLog('debug', `  ${current._.name}.afterShow (done)`);
                                            xLog('debug', `${this._.name}.stage (done)`);
                                            resolve();
                                        }).catch(reject);
                                    }).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                        } else {
                            xLog('debug', `  ${current._.name}.beforeShow (start)`);
                            current._.cfas('beforeShow').then(() => {
                                currentProtectedRef.mount();
                                currentProtectedRef.bind();
                                this.setDirection();
                                xLog('debug', `  ${current._.name}.beforeShow (done)`);
                                this.transition.in(currentProtectedRef.$el);
                                xLog('debug', `  - ${current._.name} is visible`);
                                xLog('debug', `  ${current._.name}.afterShow (start)`);
                                current._.cfas('afterShow').then(() => {
                                    currentProtectedRef.focus();
                                    xLog('debug', `  ${current._.name}.afterShow (done)`);
                                    xLog('debug', `${this._.name}.stage (done)`);
                                    resolve();
                                }).catch(reject);
                            }).catch(reject);
                        }
                    }).catch(reject);
                }).catch(reject);
            } else {
                xLog('debug', `${this._.name}.stage (not required)`);
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
                    xLog('debug', `    - direction set to rtl`);
                }
            } else {
                if (currentRTL === 'rtl') {
                    document.body.setAttribute('dir', '');
                    xLog('debug', `    - direction set to default`);
                } else {
                    xLog('debug', `    - direction remains unchanged`);
                }
            }
        });

        attr('protected');
        attr('sealed');
        this.func('mount', () => {
            let protectedRef = as(this, 'protected'),
                parentProtectedRef = as(this.parent, 'protected');
            // mount styles
            let mountStyles = (obj) => {
                let objProtectedRef = as(obj, 'protected');
                if (objProtectedRef.styles) {
                    objProtectedRef.$style = document.createElement('style');
                    objProtectedRef.$style.setAttribute('scoped', '');
                    objProtectedRef.$style.appendChild(document.createTextNode(objProtectedRef.styles));
                    objProtectedRef.$el.prepend(objProtectedRef.$style);
                }
            };

            // mount partials
            let spc = 2;
            let mountPartial = (partial) => {
                xLog('debug', `${' '.repeat(spc)}${partial._.name}.mount (start)`);
                let partialProtectedRef = as(partial, 'protected');
                partialProtectedRef.$host.append(partialProtectedRef.$el);
                mountStyles(partial);
                mountPartials(partial.partials);
                xLog('debug', `${' '.repeat(spc)}${partial._.name}.mount (end)`);
               
            };
            let mountPartials = (partials) => {
                let partial = null;
                spc = spc + 2;
                for(let po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];
                        mountPartial(partial);
                    }
                }
                spc = spc - 2;
            };

            // mount shell to stage
            parentProtectedRef.$host.append(parentProtectedRef.$el);
            mountStyles(this.parent);
            mountPartials(this.parent.partials);

            // mount view to shell container
            protectedRef.$host.append(protectedRef.$el);
            mountStyles(this);
            mountPartials(this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', () => {
            let protectedRef = as(this, 'protected'),
                parentProtectedRef = as(this.parent, 'protected');
        
            // unmount styles
            let unmountStyles = (obj) => {
                let objProtectedRef = as(obj, 'protected');
                if (objProtectedRef.$style) {
                    objProtectedRef.$style.remove();
                }
            };

            // unmount partials
            let spc = 2;
            let unmountPartial = (partial) => {
                xLog('debug', `${' '.repeat(spc)}${partial._.name}.unmount (start)`);
                let partialProtectedRef = as(partial, 'protected');
                unmountStyles(partial);
                partialProtectedRef.$el.remove();
                unmountPartials(partial.partials);
                xLog('debug', `${' '.repeat(spc)}${partial._.name}.unmount (done)`);
            };
            let unmountPartials = (partials) => {
                let partial = null;
                spc = spc + 2;
                for(let po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];                
                        unmountPartial(partial);
                    }
                }
                spc = spc - 2;
            };

            // unmount view from shell container
            unmountStyles(this);
            protectedRef.$el.remove();
            unmountPartials(this.partials);

            // unmount shell from stage
            unmountStyles(this.parent);
            parentProtectedRef.$el.remove();
            unmountPartials(this.parent.partials);
        });

        let _bindedView = null;
        attr('protected');
        attr('sealed');
        this.func('bind', () => {
            let parentProtectedRef = as(this.parent, 'protected');
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
                _bindedView = binder.bind(parentProtectedRef.$el, obj);
                xLog('debug', `    - data bindings applied`);
            }
        });

        attr('protected');
        attr('sealed');
        this.func('unbind', () => {
            if (_bindedView) {
                let binder = new DataBinder(); // its singleton, so no issue
                binder.unbind(_bindedView);
                _bindedView = null;
                xLog('debug', `    - data bindings cleared`);
            }
        });

        attr('protected');
        attr('sealed');
        this.func('focus', () => {
            let protectedRef = as(this, 'protected');
            let $focus = protectedRef.$el.querySelector('[ag-focus]');
            if ($focus) {
                $focus.focus();
                xLog('debug', `    - focus set on (${$focus.innerText})`);
            } else {
                xLog('debug', `    - focus not configured`);
            }
        });

        attr('protected');
        this.func('redirect', () => {
            if (this.request.query && this.request.query.returnUrl) {
                xLog('debug', `redirecting to: ${this.request.query.returnUrl}`);
                App.navigate(this.request.query.returnUrl, true);
            }
        });        

        this.data('title', '');
    });
});