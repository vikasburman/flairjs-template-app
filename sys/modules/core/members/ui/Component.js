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

        let _isInit = false;
        attr('sealed');
        attr('async');
        this.func('init', (resolve, reject) => {
            if (_isInit) { resolve(); return; }
            let defineHost = () => {
                let $host = null;
                switch(this.type) {
                    case 'shell':
                        $host = document.querySelector(this.settings('view.stage', '#stage'));
                        if (!$host) {
                            let $stage = document.createElement('div');
                            $stage.setAttribute('id', 'stage');
                            document.body.append($stage);
                            $host = $stage;
                        }
                        this.$host = $host;
                        break;
                    case 'view':
                        $host = this.parent.$el.querySelector(this.settings('view.container', '#container'));
                        if (!$host) {
                            let $container = document.createElement('div');
                            $container.setAttribute('id', 'container');
                            this.parent.$el.append($container);
                            $host = $container;
                        }
                        this.$host = $host;
                        break;
                    case 'partial':
                        // already defined in constructor
                        break;
                }
            };
            let loadHtml = () => {
                return new Promise((resolve, reject) => {
                    let template = this.url('index.html');
                    include([template]).then((html) => {
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
                        this.$el = template.content.firstElementChild;
                        this.$el.setAttribute('id', this._.id);

                        // done
                        resolve();
                    }).catch(reject);
                });
            };
            let initPartials = () => {
                return new Promise((_resolve, _reject) => {
                    // find partials
                    // a partial is defined in html as:
                    //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                    let $partials = this.$el.querySelectorAll('[ag-partial]'),
                        partials = [],
                        partialClassParams = [],
                        partialObjects = [],
                        className = '',
                        args = null;
                    for(let $partial of $partials) {
                        className = use($partial.getAttribute('ag-partial'));
                        args = $partial.getAttribute('ag-args');
                        args = (args ? this.env.queryStringToObject(args) : null);
                        partials.push(className);
                        partialClassParams.push({$host: $partial, args: args});
                    }

                    // get partials
                    include(partials, true).then((PartialClasses) => {
                        // instantiate all partials
                        if (PartialClasses) {
                            let i = 0,
                                pa = null;
                            for(let PartialClass of PartialClasses) {
                                pa = partialClassParams[i];
                                partialObjects.push(new PartialClass(this, pa.$host, pa.args));
                                i++; 
                            }

                            // init all partials
                            forAsync(partialObjects, (__resolve, __reject, partialObject) => { 
                                partialObject.init().then(__resolve).catch(__reject);
                            }).then(() => {
                                _partials = partialObjects;
                                _resolve();
                            }).catch(_reject);
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
                    let deps = this.$el.getAttribute('ag-deps');
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
                                            _styles += '\n/* next */\n' + thisStyle;
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
            this.beforeInit().then(() => {
                loadHtml().then(() => {
                    defineHost();
                    loadDeps().then(() => {
                        initPartials().then(() => {
                            this.afterInit().then(() => {
                                _isInit = true;
                                resolve();
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);                    
            }).catch(reject);
        });

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

        let _partials = null;
        this.prop('partials', () => { return _partials; });

        let _styles = '';
        this.prop('styles', () => { return _styles; });

        attr('protected');
        this.prop('type', '');

        attr('readonly');
        this.prop('parent', null);

        attr('readonly');
        attr('once');
        this.prop('$el', null);

        attr('readonly');
        attr('once');
        this.prop('$host', null);

        attr('readonly');
        attr('once');
        this.prop('args', null);

        this.prop('$style', null);

        let _root = '';
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
    });
});