
// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Base.js)
define('sys.core.Base', () => {
    return class Base {

        // get value of given object's nested path 
        value(path, defaultValue = null) {
            var result = defaultValue,
                obj = this,
                index = -1,
                pathArray = path.split('.');
            length = pathArray.length;
            while (obj != null && ++index < length) {
                result = obj = obj[pathArray[index]];
            };
            return result;
        }
    };
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Base.js)

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Client.js)
define('sys.core.Client', ['[Base]'], Base => {
    return class Client extends Base {};
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Client.js)

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Module.js)
define('sys.core.Module', ['[Base]'], Base => {
    return class Module extends Base {
        constructor(settings) {
            super();

            // freezed copy of module settings, updated from config 
            var _settings = Object.freeze(Object.assign(new Base(), settings || {}, config.settings[name] || {}));

            // initialize (sync)
            onInit();
        }

        // settings
        //  members can be accessed either ways: 
        //  this.settings.key.subkey.subkey <-- when you are sure it exists
        //  this.settings.value('key.subkey.subkey', '') <-- when you are not sure it exists, get default value otherwise
        get settings() {
            return _settings;
        }

        // initializer (sync)
        onInit() {}
    };
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Module.js)

// START: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Server.js)
define('sys.core.Server', ['[Base]'], Base => {
    return class Server extends Base {};
});
// END: (/Users/vikasburman/Personal/Projects/github/appgears/source/gears/modules/core/members/Server.js)