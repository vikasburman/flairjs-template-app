define([
    use('[Base]')
], (Base) => {
    return class Module extends Base {
        constructor(settings) {
            super();

            // freezed copy of module settings, updated from config 
            var _settings = Object.freeze(Object.assign(new Base(), (settings || {}), (config.settings[name] || {})));

            // initialize (sync)
            onInit();
        }

        // settings
        //  members can be accessed either ways: 
        //  this.settings.key.subkey.subkey <-- when you are sure it exists
        //  this.settings.value('key.subkey.subkey', '') <-- when you are not sure it exists, get default value otherwise
        get settings() { return _settings; }

        // initializer (sync)
        onInit() {};
    };
});