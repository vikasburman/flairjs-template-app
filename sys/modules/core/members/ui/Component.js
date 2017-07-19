define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.ui.Component
     * @classdesc sys.core.ui.Component
     * @desc UI Component base class.
     */    
    return Class('sys.core.ui.Component', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, type, parent, args) => {
            base();
            this.type = type;
            this.parent = parent;
            this.args = args;
        });

        attr('protected');
        attr('sealed');
        this.func('init', () => {
            return new Promise((resolve, reject) => {
                let defineHost = () => {
                    let $host = null,
                        elClass = '';
                    switch(this.type) {
                        case 'shell':
                            $host = document.querySelector(this.settings('view.stage', '#stage'));
                            if (!$host) {
                                let $stage = document.createElement('div');
                                $stage.setAttribute('id', 'stage');
                                document.body.append($stage);
                                $host = $stage;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            elClass = 'stage ' + elClass;
                            $host.setAttribute('class', elClass.trim());
                            
                            this._.pr.$host = $host;
                            break;
                        case 'view':
                            $host = this.parent._.pr.$el.querySelector(this.settings('view.container', '#container'));
                            if (!$host) {
                                let $container = document.createElement('div');
                                $container.setAttribute('id', 'container');
                                this.parent._.pr.$el.append($container);
                                $host = $container;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            elClass = 'container ' + elClass;
                            $host.setAttribute('class', elClass.trim());
                            
                            this._.pr.$host = $host;
                            break;
                        case 'partial':
                            // already defined where instantiated
                            break;
                    }
                };
                let loadHtml = () => {
                    return new Promise((resolve, reject) => {
                        let onLoadHtml = (html) => {
                            // process html
                            // 1. replace all {.min}.<> with .min.<> or .<> as per debug mode
                            // 2. replace all ~/<> paths with this component's root url + <>
                            // 3. replace all @:<> with shell.<> || view.<> || partials.<partial.id>.<>
                            html = replaceAll(html, '{.min}', (this.env.isProd ? '.min' : ''));
                            html = replaceAll(html, '~/', this.url());
                            switch(this.type) {
                                case 'shell': 
                                    html = replaceAll(html, '@:', 'shell.'); 
                                    break;
                                case 'view': 
                                    html = replaceAll(html, '@:', 'view.'); 
                                    break;
                                case 'partial': 
                                    html = replaceAll(html, '@:', `partials.${this._.id}.`); 
                                    break;
                            }

                            // build element
                            let template = document.createElement('template');
                            template.innerHTML = html;
                            this._.pr.$el = template.content.firstElementChild;
                            this._.pr.$el.setAttribute('id', this._.id);

                            // add class
                            let elClass = this._.pr.$el.getAttribute('class') || '';
                            elClass = this.type + ' ' + elClass;
                            this._.pr.$el.setAttribute('class', elClass.trim());

                            // done
                            resolve();
                        };
                        if (this.template) {
                            onLoadHtml(this.template);
                        } else {
                            let template = this.url('index.html');
                            include([template]).then(onLoadHtml).catch(reject);
                        }
                    });
                };
                let initPartials = () => {
                    return new Promise((_resolve, _reject) => {
                        // find partials
                        // a partial is defined in html as:
                        //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                        let $partials = this._.pr.$el.querySelectorAll('[ag-partial]'),
                            partials = [],
                            partialClassParams = [],
                            partialObjects = [],
                            className = '',
                            args = null,
                            tagName = '';
                        for(let $partial of $partials) {
                            className = use($partial.getAttribute('ag-partial'));
                            args = $partial.getAttribute('ag-args');
                            tagName = $partial.getAttribute('ag-name');
                            args = (args ? this.env.queryStringToObject(args) : null);
                            partials.push(className);
                            partialClassParams.push({$host: $partial, args: args, tagName: tagName});
                        }

                        // get partials
                        include(partials, true).then((PartialClasses) => {
                            // instantiate all partials
                            if (PartialClasses) {
                                let i = 0,
                                    pa = null,
                                    po = null;
                                for(let PartialClass of PartialClasses) {
                                    pa = partialClassParams[i];
                                    po = new PartialClass(this, pa.args);
                                    po._.pr.$host = pa.$host;
                                    po._.pr.tagName = pa.tagName;
                                    partialObjects.push(po);
                                    i++; 
                                }

                                // init all partials
                                forAsync(partialObjects, (__resolve, __reject, partialObject) => { 
                                    partialObject._.pr.init().then(() => {
                                        if (this.partials[partialObject._.pr.tagName]) {
                                            throw `partial names must be unique. ${partialObject._.pr.tagName}`;
                                        }
                                        this.partials[partialObject._.pr.tagName] = partialObject;
                                        __resolve();
                                    }).catch(__reject);
                                }).then(_resolve).catch(_reject);
                            } else {
                                _resolve();
                            }
                        }).catch(_reject);
                    });
                };
                let loadDeps = () => {
                    return new Promise((resolve, reject) => {
                        // deps are defined on main node as <div ag-deps="..., ..., ..."></div>
                        // each dep is scoped to current component's home url and are seperated by a ','
                        let deps = this._.pr.$el.getAttribute('ag-deps');
                        if (deps) {
                            let items = deps.split(','),
                                styles = [],
                                others = [];
                            for(let item of items) {
                                item = this.url(item); // add relativity
                                if (item.startsWith('text!')) {
                                    styles.push(item);
                                } else {
                                    others.push(item);
                                }
                            }
                            include(others).then(() => {
                                include(styles, true).then((allStyles) => {
                                    if (allStyles) {
                                        for(let thisStyle of allStyles) {
                                            if (thisStyle) {
                                                this.styles += '\n/* next */\n' + thisStyle;
                                            }
                                        }
                                    }
                                    resolve();
                                }).catch(reject);
                            }).catch(reject);
                        } else {
                            resolve();
                        }
                    });
                };   

                // init
                this._.pr.beforeInit().then(() => {
                    loadHtml().then(() => {
                        defineHost();
                        loadDeps().then(() => {
                            initPartials().then(() => {
                                this._.pr.afterInit().then(resolve).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);                    
                }).catch(reject);
            });
        });

        attr('protected');
        this.prop('$el', null);     

        attr('protected');
        this.prop('$host', null); 

        attr('protected');
        this.prop('$style', null);        

        attr('protected');
        this.prop('styles', '');

        attr('protected');
        this.prop('template', '');

        attr('protected');
        attr('async');
        this.func('beforeInit', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('afterInit', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('beforeShow', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('afterShow', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('beforeHide', this.noopAsync);

        attr('protected');
        attr('async');
        this.func('afterHide', this.noopAsync);

        attr('readonly');
        this.prop('partials', {});

        attr('readonly');
        this.prop('type', '');

        attr('readonly');
        this.prop('parent', null);

        attr('readonly');
        attr('once');
        this.prop('args', null);

        let _root = '';
        attr('protected');
        attr('sealed');
        this.func('url', (relativeUrl = '') => {
            if (!_root) {
                _root = use(this._.name, 'server'); // e.g., web.sample.shells.Full --> /web/modules/sample/members/shell/Full.js
                _root = _root.replace('modules/', '').replace('.js', '') + '/'; // /web/sample/members/shell/Full/
            }
            if (relativeUrl.substr(0, 1) === '/') {
                relativeUrl = relativeUrl.substr(1);
            }

            // add correct loader
            let _path = _root + relativeUrl;
            if (_path.endsWith('.css')) {
                _path = 'text!' + _path;
            } else if (_path.endsWith('.html')) {
                _path = 'text!' + _path;
            }
            return _path;
        });

        attr('protected');
        attr('sealed');
        this.func('pub', (topic, ...args) => {
            let handlers = this.env.get('handlers', null);
            if (!handlers) { 
                this.env.get('handlers', {});
            }
            let topicHandlers = handlers[topic] || [];
            for(let handler of topicHandlers) {
                handler(...args);
            }
        });

        attr('protected');
        attr('sealed');
        this.func('sub', (topic, handler) => {
            let handlers = this.env.get('handlers', null);
            if (!handlers) { 
                this.env.set('handlers', {});
            }
            handlers[topic] = handlers[topic] || [];
            handlers[topic].push(handler);
        });

        attr('protected');
        attr('sealed');
        this.func('data', (name, value) => {
            if (typeof value === 'function') { throw 'data value cannot be a function.'; }
            this._.bindable = this._.bindable || {};
            this._.bindable[name] = value;
            Object.defineProperty(this.data, name, {
                get: () => { return this._.bindable[name]; },
                set: (value) => { this._.bindable[name] = value; }
            });
        });

        attr('sealed');
        this.func('setData', (data) => {
            if (data) {
                for(let name in data) {
                    if (data.hasOwnProperty(name)) {
                        if (typeof this.data[name] === 'undefined') {
                            this.data(name, data[name]);
                        } else {
                            this.data[name] = data[name];
                        }
                    }
                }
            }
        });

        attr('sealed');
        this.func('getData', () => {
            let data = {};
            for(let name in this._.bindable) {
                if (this._.bindable.hasOwnProperty(name) && typeof this.data.name !== 'undefined') {
                    data[name] = this.data[name];
                }
            }
            return data;
        });

        attr('protected');
        attr('sealed');
        this.func('handler', (name, fn) => { 
            if (typeof fn !== 'function') { throw 'handler value must be a function.'; }
            let wrappedFn = (e) => {
                fn(e.currentTarget, e);
            };
            this._.bindable = this._.bindable || {};
            this._.bindable[name] = wrappedFn;
            Object.defineProperty(this.handler, name, {
                value: wrappedFn
            });
        });

        this._.cfas = (asyncFuncName, isSkipPartials = false, ...args) => {
            return new Promise((resolve, reject) => {
                let callOnPartials = (_obj) => {
                    return new Promise((_resolve, _reject) => {
                        let allPartials = [];
                        for(let po in _obj.partials) {
                            if (_obj.partials.hasOwnProperty(po)) {
                                allPartials.push(_obj.partials[po]);
                            }
                        }
                        if (allPartials.length > 0) {
                            forAsync(allPartials, (__resolve, __reject, partial) => {
                                partial._.cfas(asyncFuncName, ...args).then(__resolve).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // cumulative function call (async)
                switch(this.type) {
                    case 'shell':
                        if (typeof this._.pr[asyncFuncName] === 'function') {
                            this._.pr[asyncFuncName](...args).then(() => {
                                if (!isSkipPartials) {
                                    callOnPartials(this).then(resolve).catch(reject);
                                } else {
                                    resolve();
                                }
                            }).catch(reject);
                        } else {
                            resolve();
                        }  
                        break;                  
                    case 'view':
                        this.parent._.cfas(asyncFuncName, isSkipPartials, ...args).then(() => {
                            if (typeof this._.pr[asyncFuncName] === 'function') {
                                this._.pr[asyncFuncName](...args).then(() => {
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
                        break;
                    case 'partial':
                        if (typeof this._.pr[asyncFuncName] === 'function') {
                            this._.pr[asyncFuncName](...args).then(() => {
                                callOnPartials(this).then(resolve).catch(reject);
                            }).catch(reject);
                        } else {
                            resolve();
                        }                    
                        break;
                }
            });
        };    
    });
});