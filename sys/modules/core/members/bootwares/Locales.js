define([
    use('[Base]'),
    use('[IBootware]'),
    use('[ErrorInfo]')
], (Base, IBootware, ErrorInfo) => {
    /**
     * @class sys.core.bootwares.Locales
     * @classdesc sys.core.bootwares.Locales
     * @desc Configure locales and i18n basics on server and client.
     */    
    return Class('sys.core.bootwares.Locales', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // load definitions
            let defaultLocale = this.settings('locales.default', 'en-us'),
                defaultLocaleInfo = { lcid: '1033', display: 'English (United States)', rtl: false },
                supportedLocales = this.settings('locales.supported', {
                    'en-us': defaultLocaleInfo
                });

            // extend env (in global config) for locales related operations
            config.env.getLocale = () => { 
                let locale = '';
                if (!this.env.isServer) {
                    locale = sessionStorage.getItem('locale') || defaultLocale;
                } else {
                    let currentRequest = config.env.currentRequest();
                    locale = (currentRequest ? currentRequest.getLocale() : '') || defaultLocale;
                }
                let localeObj = supportedLocales[locale];
                if (!localeObj) {
                    localeObj =  defaultLocaleInfo
                } 
                localeObj.name = locale;
                return localeObj;
            };
            config.env.getLocales = () => {
                let items = [],
                    item = null;
                for(let locale in supportedLocales) {
                    if (supportedLocales.hasOwnProperty(locale)) {
                        item = supportedLocales[locale];
                        item.name = locale;
                        items.push(item);
                    }
                }
                return items;
            };

            // further extend env for client only
            if (!this.env.isServer) {
                config.env.setLocale = (locale, isSupressRefresh) => { 
                    if (supportedLocales[locale]) {
                        sessionStorage.setItem('locale', locale);
                        if (!isSupressRefresh) {
                            location.reload();
                        }
                    }
                };
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', this.noopAsync);       
    });
});