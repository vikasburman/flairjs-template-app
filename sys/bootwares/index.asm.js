'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/bootwares/members/client/Dependencies.js)
define('sys.bootwares.client.Dependencies', [use('[Base]')], function (Base) {
    /**
     * @class sys.bootwares.client.Dependencies
     * @classdesc sys.bootwares.client.Dependencies
     * @desc Load client-side dependencies.
     */
    return Class('Dependencies', Base, function (attr) {
        var _this = this;

        this.assembly = 'sys.bootwares';

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            var dependencies = _this.settings('dependencies', []);

            // TODO:  { flag: <func>, file: '<file>' } and then use include

            // load all dependencies
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = middlewares[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    mw = require(item.name); // always node modules, so not using (use)
                    if (item.args) {
                        app.use(mw.apply(undefined, _toConsumableArray(item.args)));
                    } else {
                        app.use(mw());
                    }
                }

                // dome
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

            resolve();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/bootwares/members/client/Dependencies.js)
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/bootwares/members/server/Middlewares.js)
define('sys.bootwares.server.Middlewares', [use('[Base]')], function (Base) {
    /**
     * @class sys.bootwares.server.Middlewares
     * @classdesc sys.bootwares.server.Middlewares
     * @desc Configure server-side middlewares.
     */
    return Class('Middlewares', Base, function (attr) {
        var _this = this;

        this.assembly = 'sys.bootwares';

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            var middlewares = _this.settings('middlewares', []);

            // load all middlewares
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = middlewares[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    mw = require(item.name); // always node modules, so not using (use)
                    if (item.args) {
                        app.use(mw.apply(undefined, _toConsumableArray(item.args)));
                    } else {
                        app.use(mw());
                    }
                }

                // dome
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

            resolve();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/bootwares/members/server/Middlewares.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/bootwares/members/server/Static.js)
define('sys.bootwares.server.Static', [use('[Base]'), use('serve-favicon'), use('express')], function (Base, favicon, express) {
    /**
     * @class sys.bootwares.server.Static
     * @classdesc sys.bootwares.server.Static
     * @desc Static content serving configuration.
     */
    return Class('Sttaic', Base, function (attr) {
        var _this = this;

        this.assembly = 'sys.bootwares';

        attr('async');
        this.func('boot', function (resolve, reject, app) {
            // configure favicon
            app.use(favicon(use('www/' + _this.settings('static.favIcon', ''))));

            // configure static content serving
            var age = _this.settings('static.caching.age', 0);
            if (_this.settings('static.caching.enabled') && age !== 0) {
                app.use('/', express.static(use('www/'), { maxAge: age }));
                app.use('/', express.static(use('sys/www/'), { maxAge: age }));
                app.use('/web', express.static(use('web/'), { maxAge: age }));
                app.use('/sys', express.static(use('sys/'), { maxAge: age }));
            } else {
                app.use('/', express.static(use('www/')));
                app.use('/', express.static(use('sys/www/')));
                app.use('/web', express.static(use('web/')));
                app.use('/sys', express.static(use('sys/')));
            }

            // dome
            resolve();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/bootwares/members/server/Static.js)