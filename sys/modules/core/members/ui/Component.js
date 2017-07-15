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
        attr('async');
        attr('sealed');
        this.func('init', (resolve, reject) => {
            if (_isInit) { resolve(); return; }
            this.beforeInit().then(() => {
                let template = this.getUrl('index.html');
                include(['html!' + template]).then((html) => {
                    // process html
                    // 1. replace all {.min}.<> with .min.<> or .<> as per debug mode
                    // 2. replace all ~/<> paths with this component's root url + <>
                    // 3. replace all data:<> with shell.data.<> || view.data.<> || partials.<partial.id>.data.<>
                    // 4. replace all handlers:<> with shell.handlers.<> || view.handlers.<> || partials.<partial.id>.handlers.<>
                    html = replaceAll(html, '{.min}', (this.env.isProd ? '.min' : ''));
                    html = replaceAll(html, '~/', this.url());
                    switch(this.type) {
                        case 'shell': 
                            html = replaceAll(html, 'data:', 'shell.data'); 
                            html = replaceAll(html, 'handlers:', 'shell.handlers'); 
                            break;
                        case 'view': 
                            html = replaceAll(html, 'data:', 'view.data'); 
                            html = replaceAll(html, 'handlers:', 'view.handlers'); 
                            break;
                        case 'partial': 
                            html = replaceAll(html, 'data:', `partials.${this._.id}.data`); 
                            html = replaceAll(html, 'handlers:', `partials.${this._.id}.handlers`); 
                            break;
                    }

                    // build element
                    let template = document.createElement('template');
                    template.innerHTML = html;
                    this.$el = template.content.firstElementChild;
                    this.$el.setAttribute('id', this._.id);

                    // define host
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

                    // init partials
                    let initPartials = () => {
                        let queryStringToObject = (qs) => {
                            let parts = qs.split('&'),
                                        items = null,
                                        args = {};
                            for(let part of parts) {
                                items = part.split('=');
                                args[items[0]] = items[1].trim();
                            }
                            return args;
                        };
                        return new Promise((_resolve, _reject) => {
                            // find partials
                            // a partial is defined in html as:
                            //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                            let $partials = this.$el.querySelectorAll('[ag-partial]'),
                                partials = [],
                                partialArgs = [],
                                partialObjects = [],
                                className = '',
                                args = null;
                            for(let $partial of $partials) {
                                className = use($partial.getAttribute('ag-partial'));
                                args = $partial.getAttribute('ag-args');
                                args = (args ? queryStringToObject(args) : null);
                                partials.push(className);
                                partialArgs.push(args);
                            }

                            // get partials
                            include(partials, true).then((PartialClasses) => {
                                // instantiate all partials
                                let i = 0;
                                for(let PartialClass of PartialClasses) {
                                   partialObjects.push(new PartialClass(this, $partials[i], partialArgs[i]));
                                   i++; 
                                }

                                // init all partials
                                forAsync(partialObjects, (__resolve, __reject, partialObject) => { 
                                    partialObject.init().then(__resolve).catch(__reject);
                                }).then(() => {
                                    _partials = partialObjects;
                                    _resolve();
                                });
                            }).catch(_reject);
                        });
                    };
                    initPartials().then(() => {
                        this.afterInit().then(() => {
                            _isInit = true;
                            resolve();
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('beforeInit', this.noopAsync);

        attr('async');
        this.func('afterInit', this.noopAsync);

        attr('async');
        this.func('beforeShow', this.noopAsync);

        attr('async');
        this.func('afterShow', this.noopAsync);

        attr('async');
        this.func('beforeHide', this.noopAsync);

        attr('async');
        this.func('afterHide', this.noopAsync);

        let _partials = null;
        this.prop('partials', () => { return _partials; });

        attr('readonly');
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

        let _root = '';
        this.func('url', (relativeUrl = '') => {
            if (!_root) {
                _root = use(this._.name, 'server'); // e.g., web.sample.shells.Full --> /web/modules/sample/members/shell/Full.js
                _root = '.' + _root.replace('modules/', '').replace('.js', '') + '/'; // ./web/sample/members/shell/Full/
            }
            if (relativeUrl.substr(0, 1) === '/') {
                relativeUrl = relativeUrl.substr(1);
            }
            return _root + relativeUrl;
        });
    });
});