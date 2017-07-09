'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/ui/members/SecureView.js)
define('sys.ui.SecureView', [use('[View]')], function (View) {
    /**
     * @class sys.core.ui.SecureView
     * @classdesc sys.core.ui.SecureView
     * @desc Base class for all secure (auth enabled) view classes.
     */
    return Class('sys.core.ui.SecureView', View, function (attr) {
        attr('override');
        this.func('view', function (base) {
            // TODO: auth first 

            // now call base
            return base();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/ui/members/SecureView.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/ui/members/View.js)
define('sys.ui.View', [use('[Base]')], function (Base) {
    /**
     * @class sys.core.ui.View
     * @classdesc sys.core.ui.View
     * @desc Base class for all view classes.
     */
    return Class('sys.core.ui.View', Base, function (attr) {
        var _this = this;

        this.func('constructor', function (url, args) {
            _this.url = url;
            _this.args = args;
        });

        attr('protected');
        this.prop('url', '');

        attr('protected');
        this.prop('args', null);

        attr('async');
        this.func('view', function () {
            // TODO: initiate view showing
        });

        this.func('show', function () {
            // TODO:
        });
        this.func('hide', function () {
            // TODO:
        });

        this.func('beforeShow', function () {});
        this.func('afterShow', function () {});
        this.func('beforeHide', function () {});
        this.func('afterHide', function () {});
        this.func('refresh', function () {});
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/sys/modules/ui/members/View.js)