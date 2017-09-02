'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/partials/SimpleList.js)
define('web.sample.partials.SimpleList', [use('[Partial]')], function (Partial) {
    /**
     * @class web.sample.partials.SimpleList
     * @classdesc web.sample.partials.SimpleList
     * @desc SimpleList partial.
     */
    return Class('web.sample.partials.SimpleList', Partial, function (attr) {
        var _this = this;

        attr('protected');
        attr('override');
        attr('async');
        this.func('beforeShow', function (base, resolve, reject) {
            _this.setData(_this.args);
            resolve();
        });
        this.data('abc', 0);
        this.data('xyz', 0);
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/partials/SimpleList.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/shells/Full.js)
define('web.sample.shells.Full', [use('[Shell]')], function (Shell) {
    /**
     * @class web.sample.shells.Full
     * @classdesc web.sample.shells.Full
     * @desc Shell (fully loaded version).
     */
    return Class('web.sample.shells.Full', Shell, function (attr) {
        var _this = this;

        this.data('counter', 0);

        attr('override');
        attr('async');
        this.func('beforeShow', function (base, resolve, reject) {
            base().then(function () {
                _this.sub('AddCounter', function () {
                    _this.data.counter++;
                });
                resolve();
            }).catch(reject);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/shells/Full.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/Home.js)
define('web.sample.views.Home', [use('[View]'), use('web.sample.shells.Full')], function (View, Shell) {
    /**
     * @class web.sample.views.Home
     * @classdesc web.sample.views.Home
     * @desc Home view.
     */
    return Class('web.sample.views.Home', View, function (attr) {
        var _this = this;

        attr('override');
        this.func('constructor', function (base) {
            base(Shell);
        });

        attr('protected');
        attr('override');
        attr('async');
        this.func('beforeShow', function (base, resolve, reject) {
            _this.data.title = 'This is View Title - vikas';
            resolve();
        });

        this.handler('addCounter', function ($el, e) {
            _this.pub('AddCounter');
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/Home.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/View1.js)
define('web.sample.views.View1', [use('[View]'), use('web.sample.shells.Full')], function (View, Shell) {
    /**
     * @class web.sample.views.View1
     * @classdesc web.sample.views.View1
     * @desc Home view.
     */
    return Class('web.sample.views.View1', View, function (attr) {
        attr('override');
        this.func('constructor', function (base) {
            base(Shell);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/View1.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/View2.js)
define('web.sample.views.View2', [use('[View]'), use('web.sample.shells.Full')], function (View, Shell) {
    /**
     * @class web.sample.views.View2
     * @classdesc web.sample.views.View2
     * @desc Home view.
     */
    return Class('web.sample.views.View2', View, function (attr) {
        attr('override');
        this.func('constructor', function (base) {
            base(Shell);
        });

        this.template = '<div><a href="#/">goto Home</a></div>';
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/View2.js)