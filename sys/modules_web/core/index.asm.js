'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/app/ClientApp.js)
define('web.core.app.ClientApp', [use('sys.core.app.App')], function (App) {
    /**
     * @class web.core.app.ClientApp
     * @classdesc web.core.app.ClientApp
     * @desc Starts client application.
     */
    return Class('web.core.app.ClientApp', App, function (attr) {
        this.func('navigate', function (url, returnUrlORisReplace) {
            var currentHash = document.location.hash.replace('#', '');
            if (typeof returnUrlORisReplace === 'string') {
                url += '?returnUrl=' + returnUrlORisReplace;
                if (url.substr(0, 1) === '#') {
                    url = url.substr(1);
                }
                document.location.replace('#' + url);
            } else if (typeof returnUrlORisReplace === 'boolean' && returnUrlORisReplace) {
                if (url.substr(0, 1) === '#') {
                    url = url.substr(1);
                }
                document.location.replace('#' + url);
            } else {
                document.location.hash = url;
            }
            if (currentHash === url) {
                // trigger onhashchange manually, since same hash was already there
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
        });
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/app/ClientApp.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/boot/Client.js)
define('web.core.boot.Client', [use('[Base]'), use('[IBootware]'), use('[App]'), use('[IApp]')], function (Base, IBootware, ClientApp, IApp) {
    /**
     * @class web.core.boot.Client
     * @classdesc web.core.boot.Client
     * @desc Starts client processing.
     */
    return Class('web.core.boot.Client', Base, [IBootware], function (attr) {
        var _this = this;

        attr('override');
        attr('sealed');
        this.func('constructor', function (base) {
            base();

            // resolve path of bootwares
            var bootwares = _this.settings('bootwares', []).slice(),
                more = _this.settings('more.bootwares', []).slice();
            _this.bootwares = bootwares.concat(more);
            if (_this.bootwares.length > 0) {
                var i = 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _this.bootwares[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;

                        _this.bootwares[i] = use(item);i++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        });

        attr('private');
        this.prop('bootwares', []);

        attr('async');
        this.func('boot', function (resolve, reject) {
            // env setting
            if (_this.env.isProd) {
                _this.env.set('type', 'prod');
            } else {
                if (_this.env.isDev) {
                    _this.env.set('type', 'dev');
                } else {
                    _this.env.set('type', 'dbg');
                }
            }

            // boot configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    if (Bootware && typeof Bootware === 'function') {
                        var bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.boot().then(function () {
                                xLog('debug', 'Bootware (booted): ' + bootware._.name);
                                _resolve();
                            }).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(function () {
                    // nothing as such to boot on client

                    // done
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', function (resolve, reject) {
            // instantiate app in global variable
            App = as(new ClientApp(), IApp);
            if (!App) {
                reject('Invalid app definition.');return;
            }

            // ready configured bootwares
            include(_this.bootwares, true).then(function (items) {
                forAsync(items, function (_resolve, _reject, Bootware) {
                    if (Bootware && typeof Bootware === 'function') {
                        var bootware = as(new Bootware(), IBootware);
                        if (bootware) {
                            bootware.ready().then(function () {
                                xLog('debug', 'Bootware (ready): ' + bootware._.name);
                                _resolve();
                            }).catch(_reject);
                        } else {
                            _resolve();
                        }
                    } else {
                        _resolve();
                    }
                }).then(function () {
                    // finally ready
                    _this.env.isReady = true;
                    xLog('verbose', 'ready: (client, ' + _this.env.get('type', 'unknown') + ', ' + _this.env.getLocale().name + ')');

                    // start
                    App.start().then(function () {
                        xLog('info', App.info.title + ' - ' + App.info.version);

                        if (!_this.env.isTest) {
                            // perform default action: open home view or currently opened view
                            var url = document.location.hash.replace('#', '') || '/';
                            App.navigate(url);
                        }

                        // done
                        resolve();
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/boot/Client.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/bootwares/DataBinder.js)
define('web.core.bootwares.DataBinder', [use('[Base]'), use('[IBootware]')], function (Base, IBootware) {
    /**
     * @class web.core.bootwares.DataBinder
     * @classdesc web.core.bootwares.DataBinder
     * @desc Load client-side data binding configuration.
     */
    return Class('web.core.bootwares.DataBinder', Base, [IBootware], function (attr) {
        var _this = this;

        attr('singleton');
        attr('override');
        this.func('constructor', function (base) {
            base();
        });

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // setup shim for require
            var shimFor = { name: 'rivets', path: 'web/core/libs/rivets{.min}.js' },
                shimDeps = [{ name: 'sightglass', path: 'web/core/libs/sightglass{.min}.js' }];
            _this.env.addShim(shimFor, shimDeps);

            // load rivets
            include([use('rivets')]).then(function (rivets) {
                // set
                _this.rivets = rivets;

                // configuration
                var rivetsConfig = _this.settings('rivets.config', null);
                if (rivetsConfig) {
                    rivets.configure(rivetsConfig);
                }

                // custom binders
                var loadBinders = function loadBinders() {
                    return new Promise(function (_resolve, _reject) {
                        var items = _this.settings('rivets.binders', null);
                        if (items) {
                            forAsync(items, function (__resolve, __reject, item) {
                                include([use(item)]).then(function (Binder) {
                                    // create
                                    var obj = new Binder();

                                    // validate
                                    if (!obj.binderName) {
                                        throw 'Binder name is not defined. (' + obj._.name + ')';
                                    }

                                    // define binder
                                    if (!rivets.binders[obj.binderName]) {
                                        if (!obj.isTwoWay) {
                                            // one-way binder
                                            rivets.binders[obj.binderName] = obj.routine;
                                        } else {
                                            // two-way binder
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
                var loadFormatters = function loadFormatters() {
                    return new Promise(function (_resolve, _reject) {
                        var items = _this.settings('rivets.formatters', null);
                        if (items) {
                            forAsync(items, function (__resolve, __reject, item) {
                                include([use(item)]).then(function (Formatter) {
                                    // create
                                    var obj = new Formatter();

                                    // validate
                                    if (!obj.formatterName) {
                                        throw 'Formatter name is not defined. (' + obj._.name + ')';
                                    }

                                    // define formatter
                                    if (!rivets.formatters[obj.formatterName]) {
                                        if (!obj.isTwoWay) {
                                            // one-way formatter
                                            rivets.formatters[obj.formatterName] = obj.read;
                                        } else {
                                            // two-way formatter
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
                var loadAdapters = function loadAdapters() {
                    return new Promise(function (_resolve, _reject) {
                        var items = _this.settings('rivets.adapters', null);
                        if (items) {
                            forAsync(items, function (__resolve, __reject, item) {
                                include([use(item)]).then(function (Adapter) {
                                    // create
                                    var obj = new Adapter();

                                    // validate
                                    if (!obj.adapterName) {
                                        throw 'Adapter name is not defined. (' + obj._.name + ')';
                                    }

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
                loadBinders().then(loadFormatters).then(loadAdapters).then(resolve).catch(reject);
            }).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);

        attr('private');
        this.prop('rivets', null);

        this.func('bind', function ($el, obj) {
            return rivets.bind($el, obj);
        });
        this.func('unbind', function (bindedView) {
            bindedView.unbind();
        });
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/bootwares/DataBinder.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/bootwares/Dependencies.js)
define('web.core.bootwares.Dependencies', [use('[Base]'), use('[IBootware]')], function (Base, IBootware) {
    /**
     * @class web.core.bootwares.Dependencies
     * @classdesc web.core.bootwares.Dependencies
     * @desc Load client-side dependencies.
     */
    return Class('web.core.bootwares.Dependencies', Base, [IBootware], function (attr) {
        var _this = this;

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            var dependencies = _this.settings('dependencies', []),
                more = _this.settings('more.dependencies', []);
            dependencies = dependencies.concat(more);

            // load all dependencies
            // each definition is:
            // "path"
            // path: path of the dependency file
            var deps = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var dep = _step.value;

                    deps.push(use(dep)); // resolve names
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            forAsync(deps, function (resolve, reject, dep) {
                _this.env.loadScript(dep).then(resolve).catch(reject);
            }).then(resolve).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/bootwares/Dependencies.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Adapter.js)
define('web.core.ui.Adapter', [use('[Base]')], function (Base) {
    /**
     * @class web.core.ui.Adapter
     * @classdesc web.core.ui.Adapter
     * @desc Adapter base class to define custom adapters for rivets.
     */
    return Class('web.core.ui.Adapter', Base, function (attr) {
        this.prop('adapterName', '');
        this.func('observe', this.noop);
        this.func('unobserve', this.noop);
        this.func('get', this.noop);
        this.func('set', this.noop);
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Adapter.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Binder.js)
define('web.core.ui.Binder', [use('[Base]')], function (Base) {
    /**
     * @class web.core.ui.Binder
     * @classdesc web.core.ui.Binder
     * @desc Binder base class to define custom binders for rivets.
     */
    return Class('web.core.ui.Binder', Base, function (attr) {
        this.prop('binderName', '');
        this.func('bind', this.noop);
        this.func('unbind', this.noop);
        this.func('routine', this.noop);
        this.func('getValue', this.noop);
        this.prop('isTwoWay', false);
        this.prop('publishes', false);
        this.prop('block', false);
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Binder.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Component.js)
define('web.core.ui.Component', [use('[Base]'), use('[ComponentTypes]')], function (Base, ComponentTypes) {
    /**
     * @class web.core.ui.Component
     * @classdesc web.core.ui.Component
     * @desc UI Component base class.
     */
    return Class('web.core.ui.Component', Base, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, type, parent, args) {
            base();
            _this.type = type;
            _this.parent = parent;
            _this.args = args;
            _this.data.assets = {}; // special data name, where all assets are loaded
        });

        attr('protected');
        attr('sealed');
        this.func('init', function () {
            return new Promise(function (resolve, reject) {
                var defineHost = function defineHost() {
                    var $host = null,
                        elClass = '';
                    switch (_this.type) {
                        case ComponentTypes.Shell:
                            $host = document.querySelector(_this.settings('view.$stage', '#stage'));
                            if (!$host) {
                                var $stage = document.createElement('div');
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

                            _this._.pr.$host = $host;
                            break;
                        case ComponentTypes.View:
                            $host = _this.parent._.pr.$el.querySelector(_this.settings('view.$container', '#container'));
                            if (!$host) {
                                var $container = document.createElement('div');
                                $container.setAttribute('id', 'container');
                                _this.parent._.pr.$el.append($container);
                                $host = $container;
                            }

                            // set class
                            elClass = $host.getAttribute('class') || '';
                            if (elClass.indexOf('ag-container') === -1) {
                                elClass = 'ag-container ' + elClass;
                            }
                            $host.setAttribute('class', elClass.trim());

                            _this._.pr.$host = $host;
                            break;
                        case ComponentTypes.Partial:
                            // already defined where instantiated
                            break;
                    }
                };
                var loadHtml = function loadHtml() {
                    return new Promise(function (resolve, reject) {
                        var onLoadHtml = function onLoadHtml(html) {
                            // process html
                            // 1. replace all {.min}.<> with .min.<> or .<> as per debug mode
                            // 2. replace all ~/<> paths with this component's root url + <>
                            // 3. replace all @:<> with shell.<> || view.<> || partials.<partial.id>.<>
                            html = replaceAll(html, '{.min}', _this.env.isProd ? '.min' : '');
                            html = replaceAll(html, '~/', _this.url());
                            switch (_this.type) {
                                case ComponentTypes.Shell:
                                    html = replaceAll(html, '@:', 'shell.');
                                    break;
                                case ComponentTypes.View:
                                    html = replaceAll(html, '@:', 'view.');
                                    break;
                                case ComponentTypes.Partial:
                                    html = replaceAll(html, '@:', 'partials.' + _this._.id + '.');
                                    break;
                            }

                            // build element
                            var template = document.createElement('template');
                            template.innerHTML = html;
                            _this._.pr.$el = template.content.firstElementChild;
                            _this._.pr.$el.setAttribute('id', _this._.id);

                            // add class
                            var elClass = _this._.pr.$el.getAttribute('class') || '',
                                elClassName = '';
                            switch (_this.type) {
                                case ComponentTypes.Shell:
                                    elClassName = 'shell';break;
                                case ComponentTypes.View:
                                    elClassName = 'view';break;
                                case ComponentTypes.Partial:
                                    elClassName = 'partial';break;
                            }
                            if (elClass.indexOf('ag-' + elClassName) === -1) {
                                elClass = 'ag-' + elClassName + ' ' + elClass;
                            }
                            _this._.pr.$el.setAttribute('class', elClass.trim());

                            // done
                            resolve();
                        };
                        if (_this.template) {
                            onLoadHtml(_this.template);
                        } else {
                            var template = _this.url('index.html');
                            include([template]).then(onLoadHtml).catch(reject);
                        }
                    });
                };
                var initPartials = function initPartials() {
                    return new Promise(function (_resolve, _reject) {
                        // find partials
                        // a partial is defined in html as:
                        //  <div ag-partial="web.sample.partials.SimpleList" ag-args="abc=10&xyz=20"></div>
                        var $partials = _this._.pr.$el.querySelectorAll('[ag-partial]'),
                            partials = [],
                            partialClassParams = [],
                            partialObjects = [],
                            className = '',
                            args = null,
                            tagName = '';
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = $partials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var $partial = _step.value;

                                className = use($partial.getAttribute('ag-partial'));
                                args = $partial.getAttribute('ag-args');
                                tagName = $partial.getAttribute('ag-name');
                                args = args ? _this.env.queryStringToObject(args) : null;
                                partials.push(className);
                                partialClassParams.push({ $host: $partial, args: args, tagName: tagName });
                            }

                            // get partials
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        include(partials, true).then(function (PartialClasses) {
                            // instantiate all partials
                            if (PartialClasses) {
                                var i = 0,
                                    pa = null,
                                    po = null;
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = PartialClasses[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var PartialClass = _step2.value;

                                        pa = partialClassParams[i];
                                        po = new PartialClass(_this, pa.args);
                                        po._.pr.$host = pa.$host;
                                        po._.pr.tagName = pa.tagName || po._.id;
                                        partialObjects.push(po);
                                        i++;
                                    }

                                    // init all partials
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                            _iterator2.return();
                                        }
                                    } finally {
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }

                                forAsync(partialObjects, function (__resolve, __reject, partialObject) {
                                    partialObject._.pr.init().then(function () {
                                        if (_this.partials[partialObject._.pr.tagName]) {
                                            throw 'partial names must be unique. ' + partialObject._.pr.tagName;
                                        }
                                        _this.partials[partialObject._.pr.tagName] = partialObject;
                                        __resolve();
                                    }).catch(__reject);
                                }).then(_resolve).catch(_reject);
                            } else {
                                _resolve();
                            }
                        }).catch(_reject);
                    });
                };
                var loadDeps = function loadDeps() {
                    return new Promise(function (resolve, reject) {
                        // deps are defined on main node as <div ag-deps="..., ..., ..."></div>
                        // each dep is scoped to current component's home url and are seperated by a ','
                        var deps = _this._.pr.$el.getAttribute('ag-deps');
                        if (deps) {
                            var items = deps.split(','),
                                styles = [],
                                others = [];
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var item = _step3.value;

                                    item = _this.url(item); // add relativity
                                    if (item.startsWith('text!')) {
                                        styles.push(item);
                                    } else {
                                        others.push(item);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError3 = true;
                                _iteratorError3 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                    }
                                } finally {
                                    if (_didIteratorError3) {
                                        throw _iteratorError3;
                                    }
                                }
                            }

                            include(others).then(function () {
                                include(styles, true).then(function (allStyles) {
                                    if (allStyles) {
                                        var _iteratorNormalCompletion4 = true;
                                        var _didIteratorError4 = false;
                                        var _iteratorError4 = undefined;

                                        try {
                                            for (var _iterator4 = allStyles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                                var thisStyle = _step4.value;

                                                if (thisStyle) {
                                                    _this.styles += '\n/* next */\n' + thisStyle;
                                                }
                                            }
                                        } catch (err) {
                                            _didIteratorError4 = true;
                                            _iteratorError4 = err;
                                        } finally {
                                            try {
                                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                                    _iterator4.return();
                                                }
                                            } finally {
                                                if (_didIteratorError4) {
                                                    throw _iteratorError4;
                                                }
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
                var loadAssets = function loadAssets() {
                    return new Promise(function (resolve, reject) {
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
                        var assetNames = [],
                            assets = [];
                        for (var assetName in _assets) {
                            if (_this.asset.hasOwnProperty(assetName)) {
                                assetNames.push(assetName);
                                assets.push(_this.asset[assetName]);
                            }
                        }

                        // load files
                        include(assets, true).then(function () {
                            var objects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

                            var i = 0,
                                assetName = '',
                                assetValue = '';
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = objects[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var assetObject = _step5.value;

                                    assetName = assetNames[i];
                                    _this.data.assets[assetName] = assetObject;
                                    for (var assetKey in assetObject) {
                                        if (assetObject.hasOwnProperty(assetKey)) {
                                            assetValue = assetObject[assetKey];
                                            if (assetValue.substr(0, 1) === '/') {
                                                // this is a url
                                                assetObject[assetKey] = _this.url(assetValue); // make it relative url
                                            }
                                        }
                                    }
                                    i++; // next asset
                                }
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            resolve();
                        }).catch(reject);
                    });
                };

                // init
                _this._.pr.beforeInit().then(function () {
                    loadAssets().then(function () {
                        loadHtml().then(function () {
                            defineHost();
                            loadDeps().then(function () {
                                initPartials().then(function () {
                                    _this._.pr.afterInit().then(resolve).catch(reject);
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

        var _root = '';
        attr('protected');
        attr('sealed');
        this.func('url', function () {
            var relativeUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            if (!_root) {
                _root = use(_this._.name, 'server'); // e.g., web.sample.shells.Full --> /web/modules/sample/members/shell/Full.js
                _root = _root.replace('modules/', '').replace('.js', '') + '/'; // /web/sample/members/shell/Full/
            }
            if (relativeUrl.substr(0, 1) === '/') {
                relativeUrl = relativeUrl.substr(1);
            }

            // locale handling
            if (relativeUrl.indexOf('/assets/') !== -1) {
                relativeUrl = relativeUrl.replace('/assets/', '/assets/' + _this.env.getLocate().name + '/');
            }

            // add correct loader
            var _path = _root + relativeUrl;
            if (_path.endsWith('.css')) {
                _path = 'text!' + _path;
            } else if (_path.endsWith('.html')) {
                _path = 'text!' + _path;
            }
            return _path;
        });

        attr('protected');
        attr('sealed');
        this.func('pub', function (topic) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            var handlers = _this.env.get('handlers', null);
            if (!handlers) {
                _this.env.get('handlers', {});
            }
            var topicHandlers = handlers[topic] || [];
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = topicHandlers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var handler = _step6.value;

                    handler.apply(undefined, args);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        });

        attr('protected');
        attr('sealed');
        this.func('sub', function (topic, handler) {
            var handlers = _this.env.get('handlers', null);
            if (!handlers) {
                _this.env.set('handlers', {});
            }
            handlers[topic] = handlers[topic] || [];
            handlers[topic].push(handler);
        });

        attr('protected');
        attr('sealed');
        this.func('data', function (name, value) {
            if (typeof value === 'function') {
                throw 'data value cannot be a function.';
            }
            _this._.bindable = _this._.bindable || {};
            if (typeof _this._.bindable[name] !== 'undefined') {
                throw name + ' already defined as data/handler.';
            }
            _this._.bindable[name] = value;
            Object.defineProperty(_this.data, name, {
                get: function get() {
                    return _this._.bindable[name];
                },
                set: function set(value) {
                    _this._.bindable[name] = value;
                }
            });
        });

        attr('sealed');
        this.func('setData', function (data) {
            if (data) {
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        if (typeof _this.data[name] === 'undefined') {
                            _this.data(name, data[name]);
                        } else {
                            _this.data[name] = data[name];
                        }
                    }
                }
            }
        });

        attr('sealed');
        this.func('getData', function () {
            var data = {};
            for (var name in _this._.bindable) {
                if (_this._.bindable.hasOwnProperty(name) && typeof _this.data.name !== 'undefined') {
                    data[name] = _this.data[name];
                }
            }
            return data;
        });

        attr('protected');
        attr('sealed');
        this.func('handler', function (name, fn) {
            if (typeof fn !== 'function') {
                throw 'handler value must be a function.';
            }
            var wrappedFn = function wrappedFn(e) {
                fn(e.currentTarget, e);
            };
            _this._.bindable = _this._.bindable || {};
            if (typeof _this._.bindable[name] !== 'undefined') {
                throw name + ' already defined as data/handler.';
            }
            _this._.bindable[name] = wrappedFn;
            Object.defineProperty(_this.handler, name, {
                value: wrappedFn
            });
        });

        var _assets = {};
        attr('protected');
        this.func('asset', function (name, bundleUrl) {
            if (typeof _this.asset[name] !== 'undefined') {
                throw name + ' already defined.';
            }
            _this.asset[name] = _this.url(bundleUrl); // actual bundle object will be loaded at this.data.assets.<name> after init is executed
            _assets[name] = _this.asset[name];
        });

        this._.cfas = function (asyncFuncName) {
            for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                args[_key2 - 2] = arguments[_key2];
            }

            var isSkipPartials = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return new Promise(function (resolve, reject) {
                var _parent$_;

                var callOnPartials = function callOnPartials(_obj) {
                    return new Promise(function (_resolve, _reject) {
                        var allPartials = [];
                        for (var po in _obj.partials) {
                            if (_obj.partials.hasOwnProperty(po)) {
                                allPartials.push(_obj.partials[po]);
                            }
                        }
                        if (allPartials.length > 0) {
                            forAsync(allPartials, function (__resolve, __reject, partial) {
                                var _partial$_;

                                (_partial$_ = partial._).cfas.apply(_partial$_, [asyncFuncName].concat(args)).then(__resolve).catch(__reject);
                            }).then(_resolve).catch(_reject);
                        } else {
                            _resolve();
                        }
                    });
                };

                // cumulative function call (async)
                switch (_this.type) {
                    case ComponentTypes.Shell:
                        if (typeof _this._.pr[asyncFuncName] === 'function') {
                            var _$pr;

                            (_$pr = _this._.pr)[asyncFuncName].apply(_$pr, args).then(function () {
                                if (!isSkipPartials) {
                                    callOnPartials(_this).then(resolve).catch(reject);
                                } else {
                                    resolve();
                                }
                            }).catch(reject);
                        } else {
                            resolve();
                        }
                        break;
                    case ComponentTypes.View:
                        (_parent$_ = _this.parent._).cfas.apply(_parent$_, [asyncFuncName, isSkipPartials].concat(args)).then(function () {
                            if (typeof _this._.pr[asyncFuncName] === 'function') {
                                var _$pr2;

                                (_$pr2 = _this._.pr)[asyncFuncName].apply(_$pr2, args).then(function () {
                                    if (!isSkipPartials) {
                                        callOnPartials(_this).then(resolve).catch(reject);
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
                        if (typeof _this._.pr[asyncFuncName] === 'function') {
                            var _$pr3;

                            (_$pr3 = _this._.pr)[asyncFuncName].apply(_$pr3, args).then(function () {
                                callOnPartials(_this).then(resolve).catch(reject);
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
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Component.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/ComponentTypes.js)
define('web.core.ui.ComponentTypes', function () {
    /**
     * @class web.core.ui.ComponentTypes
     * @classdesc web.core.ui.ComponentTypes
     * @desc Component types.
     */
    return Enum('web.core.ui.ComponentTypes', {
        Shell: 0,
        View: 1,
        Partial: 2
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/ComponentTypes.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Formatter.js)
define('web.core.ui.Formatter', [use('[Base]')], function (Base) {
    /**
     * @class web.core.ui.Formatter
     * @classdesc web.core.ui.Formatter
     * @desc Formatter base class to define custom formatters for rivets.
     */
    return Class('web.core.ui.Formatter', Base, function (attr) {
        this.prop('formatterName', '');
        this.func('read', this.noop);
        this.func('publish', this.noop);
        this.prop('isTwoWay', false);
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Formatter.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Partial.js)
define('web.core.ui.Partial', [use('[Component]'), use('[ComponentTypes]')], function (Component, ComponentTypes) {
    /**
     * @class web.core.ui.Partial
     * @classdesc web.core.ui.Partial
     * @desc Partial base class.
     */
    return Class('web.core.ui.Partial', Component, function (attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', function (base, parent, args) {
            base(ComponentTypes.Partial, parent, args);
        });

        attr('protected');
        attr('once');
        this.prop('tagName', '');
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Partial.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Shell.js)
define('web.core.ui.Shell', [use('[Component]'), use('[ComponentTypes]')], function (Component, ComponentTypes) {
    /**
     * @class web.core.ui.Shell
     * @classdesc web.core.ui.Shell
     * @desc Shell base class.
     */
    return Class('web.core.ui.Shell', Component, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, args, view) {
            base(ComponentTypes.Shell, null, args);
            _this.child = view;
        });

        attr('readonly');
        this.prop('child', null);
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Shell.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Transition.js)
define('web.core.ui.Transition', [use('[Base]')], function (Base) {
    /**
     * @class web.core.ui.Transition
     * @classdesc web.core.ui.Transition
     * @desc Transition base class with default transition.
     */
    return Class('web.core.ui.Transition', Base, function (attr) {
        this.func('in', function ($new) {
            var $current = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if ($current) {
                $current.style.display = 'none';
            }
            $new.style.display = 'block';
        });
        this.func('out', function ($current) {
            var $new = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            $current.style.display = 'none';
            if ($new) {
                $new.style.display = 'block';
            }
        });
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/Transition.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/View.js)
define('web.core.ui.View', [use('[Component]'), use('[ComponentTypes]'), use('[Transition]'), use('[DataBinder]')], function (Component, ComponentTypes, DefaultTransition, DataBinder) {
    /**
     * @class web.core.ui.View
     * @classdesc web.core.ui.View
     * @desc View base class.
     */
    return Class('web.core.ui.View', Component, function (attr) {
        var _this = this;

        attr('override');
        attr('abstract');
        this.func('constructor', function (base, Shell, Transition) {
            var shell = new Shell(null, _this);
            base(ComponentTypes.View, shell, null);
            if (Transition) {
                _this.transition = new Transition();
            } else {
                _this.transition = new DefaultTransition();
            }
        });

        attr('protected');
        this.prop('request', null);

        attr('async');
        this.func('navigate', function (resolve, reject, request) {
            _this.request = request;
            _this.args = request.args;
            _this.stage().then(function () {
                _this.current = _this._.pu; // store public reference
                document.title = _this.data.title + ' - ' + App.info.title;
                resolve(_this.current);
            }).catch(function (err) {
                _this.onError(err, 'Failed to navigate to ' + request.url + '.');
                reject(err);
            });
        });

        attr('private');
        attr('async');
        this.func('stage', function (resolve, reject) {
            if (_this.current !== _this) {
                // reset handlers
                _this.env.set('handlers', {});

                var last = _this.current,
                    current = _this;
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
                _this.parent._.pr.init().then(function () {
                    _this._.pr.init().then(function () {
                        if (last) {
                            last._.cfas('beforeHide').then(function () {
                                current._.cfas('beforeShow').then(function () {
                                    current._.pr.mount();
                                    current._.pr.bind();
                                    _this.setDirection();
                                    _this.transition.in(current._.pr.$el, last._.pr.$el);
                                    last._.cfas('afterHide').then(function () {
                                        last._.pr.unbind();
                                        last._.pr.unmount();
                                        current._.cfas('afterShow').then(function () {
                                            current._.pr.focus();
                                            resolve();
                                        }).catch(reject);
                                    }).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                        } else {
                            current._.cfas('beforeShow').then(function () {
                                current._.pr.mount();
                                current._.pr.bind();
                                _this.setDirection();
                                _this.transition.in(current._.pr.$el);
                                current._.cfas('afterShow').then(function () {
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
        this.prop('current', function () {
            return _this.env.get('currentView', null);
        }, function (view) {
            _this.env.set('currentView', view);
        });

        attr('private');
        this.func('setDirection', function () {
            // set/reset rtl
            var currentRTL = document.body.getAttribute('dir');
            if (_this.env.getLocale().rtl) {
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
        this.func('mount', function () {
            // mount styles
            var mountStyles = function mountStyles(obj) {
                if (obj._.pr.styles) {
                    obj._.pr.$style = document.createElement('style');
                    obj._.pr.$style.setAttribute('scoped', '');
                    obj._.pr.$style.appendChild(document.createTextNode(obj._.pr.styles));
                    obj._.pr.$el.prepend(obj._.pr.$style);
                }
            };

            // mount partials
            var mountPartial = function mountPartial(partial) {
                partial._.pr.$host.append(partial._.pr.$el);
                mountStyles(partial);
                mountPartials(partial.partials);
            };
            var mountPartials = function mountPartials(partials) {
                var partial = null;
                for (var po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];
                        mountPartial(partial);
                    }
                }
            };

            // mount shell to stage
            _this.parent._.pr.$host.append(_this.parent._.pr.$el);
            mountStyles(_this.parent);
            mountPartials(_this.parent.partials);

            // mount view to shell container
            _this._.pr.$host.append(_this._.pr.$el);
            mountStyles(_this);
            mountPartials(_this.partials);
        });

        attr('protected');
        attr('sealed');
        this.func('unmount', function () {
            // unmount styles
            var unmountStyles = function unmountStyles(obj) {
                if (obj._.pr.$style) {
                    obj._.pr.$style.remove();
                }
            };

            // unmount partials
            var unmountPartial = function unmountPartial(partial) {
                unmountStyles(partial);
                partial._.pr.$el.remove();
                unmountPartials(partial.partials);
            };
            var unmountPartials = function unmountPartials(partials) {
                var partial = null;
                for (var po in partials) {
                    if (partials.hasOwnProperty(po)) {
                        partial = partials[po];
                        unmountPartial(partial);
                    }
                }
            };

            // unmount view from shell container
            unmountStyles(_this);
            _this._.pr.$el.remove();
            unmountPartials(_this.partials);

            // unmount shell from stage
            unmountStyles(_this.parent);
            _this.parent._.pr.$el.remove();
            unmountPartials(_this.parent.partials);
        });

        var _bindedView = null;
        attr('protected');
        attr('sealed');
        this.func('bind', function () {
            if (!_bindedView) {
                var getPartialBindings = function getPartialBindings(target, _obj) {
                    var partial = null;
                    for (var po in _obj.partials) {
                        if (_obj.partials.hasOwnProperty(po)) {
                            partial = _obj.partials[po];
                            target[partial._.id] = partial._.bindable;
                            getPartialBindings(target, partial);
                        }
                    }
                };

                // get bindings
                var obj = {
                    partials: {},
                    shell: _this.parent._.bindable,
                    view: _this._.bindable
                };
                getPartialBindings(obj.partials, _this.parent);
                getPartialBindings(obj.partials, _this);

                // bind
                var binder = new DataBinder(); // its singleton, so no issue
                _bindedView = binder.bind(_this.parent._.pr.$el, obj);
            }
        });

        attr('protected');
        attr('sealed');
        this.func('unbind', function () {
            if (_bindedView) {
                var binder = new DataBinder(); // its singleton, so no issue
                binder.unbind(_bindedView);
                _bindedView = null;
            }
        });

        attr('protected');
        attr('sealed');
        this.func('focus', function () {
            var $focus = _this._.pr.$el.querySelector('[ag-focus');
            if ($focus) {
                $focus.focus();
            }
        });

        attr('protected');
        this.func('redirect', function () {
            if (_this.request.query && _this.request.query.returnUrl) {
                App.navigate(_this.request.query.returnUrl, true);
            }
        });

        this.data('title', '');
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/View.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/binders/xClass.js)
define('web.core.ui.binders.xClass', [use('[Binder]')], function (Binder) {
    /**
     * @class web.core.ui.binders.Xclass
     * @classdesc web.core.ui.binders.Xclass
     * @desc Adds extra class to element, if given value is not empty.
     */
    return Class('web.core.ui.binders.Xclass', Binder, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base) {
            base();
            _this.binderName = 'xclass';
            _this.isTwoWay = false;
        });

        attr('override');
        this.func('routine', function (base, $el, value) {
            base();
            $el.className += ' ' + value;
        });
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/binders/xClass.js)
'use strict';

// START: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/formatters/Percent.js)
define('web.core.ui.formatters.Percent', [use('[Formatter]')], function (Formatter) {
    /**
     * @class web.core.ui.formatters.Percent
     * @classdesc web.core.ui.formatters.Percent
     * @desc Percent formatter, adds % symbol to given value.
     */
    return Class('web.core.ui.formatters.Percent', Formatter, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base) {
            base();
            _this.formatterName = 'percent';
            _this.isTwoWay = false;
        });

        attr('override');
        this.func('read', function (base, value) {
            base();
            return value + '%';
        });
    });
});
// END: (/Users/vikasburman/Data/Projects/GitHub/appgears/source/sys/modules_web/core/members/ui/formatters/Percent.js)