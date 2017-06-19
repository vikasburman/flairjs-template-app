'use strict';

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/main/members/Application.js)
define('web.main.Application', [use('[Base]')], function (Base) {
    return Class('Application', Base, function (attr) {
        attr('async');
        this.func('start', function (resolve, reject) {
            resolve();
        });
    });
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/web/main/members/Application.js)