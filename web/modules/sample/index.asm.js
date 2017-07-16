'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/partials/SimpleList.js)
define('web.sample.partials.SimpleList', [use('sys.core.ui.Partial')], function (Partial) {
    /**
     * @class web.sample.partials.SimpleList
     * @classdesc web.sample.partials.SimpleList
     * @desc SimpleList partial.
     */
    return Class('web.sample.partials.SimpleList', Partial, function (attr) {});
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/partials/SimpleList.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/shells/Full.js)
define('web.sample.shells.Full', [use('sys.core.ui.Shell')], function (Shell) {
    /**
     * @class web.sample.shells.Full
     * @classdesc web.sample.shells.Full
     * @desc Shell (fully loaded version).
     */
    return Class('web.sample.shells.Full', Shell, function (attr) {});
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/shells/Full.js)
'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/Home.js)
define('web.sample.views.Home', [use('sys.core.ui.View'), use('web.sample.shells.Full')], function (View, Shell) {
    /**
     * @class web.sample.views.Home
     * @classdesc web.sample.views.Home
     * @desc Home view.
     */
    return Class('web.sample.views.Home', View, function (attr) {
        attr('override');
        this.func('constructor', function (base) {
            base(Shell);
        });

        attr('override');
        attr('endpoint');
        this.func('navigate', function (base, resolve, reject, request) {
            console.log('initiating navigate');
            base(request).then(function () {
                console.log('navigation done.');
                resolve();
            }).catch(reject);
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/modules/sample/members/views/Home.js)