define([
    use('[Base]'),
    use('sys.core.ui.ComponentTypes')
], (Base, ComponentTypes) => {
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
            this.data.assets = {}; // special data name, where all assets are loaded
        });

        attr('protected');
        attr('sealed');
        this.func('init', () => {
            return new Promise((resolve, reject) => {
                const defineHost = () => {
                    let $host = null,
                        elClass = '';
                    switch(this.type) {
                        case ComponentTypes.Shell:
                            $host = document.querySelector(this.settings('view.stage', '#stage'));
                            if (!$host) {
                                let $stage = document.createElement('div');
                                $stage.setAttribute('id', 'stage');
                                document.body.append($stage);
                                $host = $stage;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            if (elClass.indexOf('ag-stage') === -1) {
                                elClass = 'ag-stage ' + elClass;
                            }
                            $host.setAttribute('class', elClass.trim());
                            
                            this._.pr.$host = $host;
                            break;
                        case ComponentTypes.View:
                            $host = this.parent._.pr.$el.querySelector(this.settings('view.container', '#container'));
                            if (!$host) {
                                let $container = document.createElement('div');
                                $container.setAttribute('id', 'container');
                                this.parent._.pr.$el.append($container);
                                $host = $container;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            if (elClass.indexOf('ag-container') === -1) {
                                elClass = 'ag-container ' + elClass;
                            }
                            $host.setAttribute('class', elClass.trim());
                            
                            this._.pr.$host = $host;
                            break;
                        case ComponentTypes.Partial:
                            // already defined where instantiated
                            break;
                    }
                };
                const loadHtml = () => {
                    return new Promise((resolve, reject) => {
                        let onLoadHtml = (html) => {
                            // process html
                            // 1. replace all {.min}.<> with .min.<> or .<> as per debug mode
                            // 2. replace all ~/<> paths with this component's root url + <>
                            // 3. replace all @:<> with shell.<> || view.<> || partials.<partial.id>.<>
                            html = replaceAll(html, '{.min}', (this.env.isProd ? '.min' : ''));
                            html = replaceAll(html, '~/', this.url());
                            switch(this.type) {
                                case ComponentTypes.Shell: 
                                    html = replaceAll(html, '@:', 'shell.'); 
                                    break;
                                case ComponentTypes.View: 
                                    html = replaceAll(html, '@:', 'view.'); 
                                    break;
                                case ComponentTypes.Partial: 
                                    html = replaceAll(html, '@:', `partials.${this._.id}.`); 
                                    break;
                            }

                            // build element
                            let template = document.createElement('template');
                            template.innerHTML = html;
                            this._.pr.$el = template.content.firstElementChild;
                            this._.pr.$el.setAttribute('id', this._.id);

                            // add class
                            let elClass = this._.pr.$el.getAttribute('class') || '',
                                elClassName = '';
                            switch(this.type) {
                                case ComponentTypes.Shell: elClassName = 'shell'; break;
                                case ComponentTypes.View: elClassName = 'view'; break;
                                case ComponentTypes.Partial: elClassName = 'partial'; break;
                            }
                            if (elClass.indexOf('ag-' + elClassName) === -1) {
                                elClass = 'ag-' + elClassName + ' ' + elClass;
                            }
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
                const initPartials = () => {
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
                                    po._.pr.tagName = pa.tagName || po._.id;
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
                const loadDeps = () => {
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
                const loadAssets = () => {
                    return new Promise((resolve, reject) => {
                        // assets are non-nested resource bundle JSON files
                        // { 
                        //      "key1": "stringValue",
                        //      "key2": number / boolean / date / ...
                        //      "key3": "/url/of/a/file" <-- must start with "/" to identify it as a relative url
                        // }
                        //
                        // assets can be defined in a UI component as:
                        // this.asset('myAsset1', 'sys/core/assets/myAsset1.json');
                        // 
                        // this will be available after init as:
                        // this.data.assets.myAsset1 object having 
                        // {
                        //      key1: "stringValue",
                        //      key2: ...
                        //      key3: "sys/core/assets/<lcId>/url/of/a/file"    
                        // }

                        // files to load
                        let assetNames = [],
                            assets = [];
                        for(let assetName in _assets) {
                            if (this.asset.hasOwnProperty(assetName)) {
                                assetNames.push(assetName);
                                assets.push(this.asset[assetName]);
                            }
                        }

                        // load files
                        include(assets, true).then((objects = []) => {
                            let i = 0,
                                assetName = '', 
                                assetValue = '';
                            for(let assetObject of objects) {
                                assetName = assetNames[i];
                                this.data.assets[assetName] = assetObject;
                                for(let assetKey in assetObject) {
                                    if (assetObject.hasOwnProperty(assetKey)) {
                                        assetValue = assetObject[assetKey];
                                        if (assetValue.substr(0, 1) === '/') { // this is a url
                                            assetObject[assetKey] = this.url(assetValue); // make it relative url
                                        }
                                    }
                                }
                                i++; // next asset
                            }
                            resolve();
                        }).catch(reject);
                    });
                };

                // init
                this._.pr.beforeInit().then(() => {
                    loadAssets().then(() => {
                        loadHtml().then(() => {
                            defineHost();
                            loadDeps().then(() => {
                                initPartials().then(() => {
                                    this._.pr.afterInit().then(resolve).catch(reject);
                                }).catch(reject);
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
        this.prop('type', -1);

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

            // locale handling
            if (relativeUrl.indexOf('/assets/') !== -1) {
                relativeUrl = relativeUrl.replace('/assets/', '/assets/' + this.env.getLocate().name + '/');
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
            if (typeof this._.bindable[name] !== 'undefined') { throw `${name} already defined as data/handler.`; }
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
            if (typeof this._.bindable[name] !== 'undefined') { throw `${name} already defined as data/handler.`; }
            this._.bindable[name] = wrappedFn;
            Object.defineProperty(this.handler, name, {
                value: wrappedFn
            });
        });

        let _assets = {};
        attr('protected');
        this.func('asset', (name, bundleUrl) => {
            if (typeof this.asset[name] !== 'undefined') { throw `${name} already defined.`; }
            this.asset[name] = this.url(bundleUrl); // actual bundle object will be loaded at this.data.assets.<name> after init is executed
            _assets[name] = this.asset[name];
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
                    case ComponentTypes.Shell:
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
                    case ComponentTypes.View:
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
                    case ComponentTypes.Partial:
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