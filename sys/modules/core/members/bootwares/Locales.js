define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class sys.core.bootwares.Locales
     * @classdesc sys.core.bootwares.Locales
     * @desc Configure locales and i18n basics on server and client.
     */    
    return Class('sys.core.bootwares.Locales', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // load definitions
            let inbuiltDefaultLocale = 'en-us',
                inbuiltDefaultLocaleInfo = { name: inbuiltDefaultLocale, lcid: '1033', display: 'English (United States)', rtl: false },
                localesList = {inbuiltDefaultLocale: inbuiltDefaultLocaleInfo},
                locales = this.settings('locales', localesList),
                supportedLocales = this.settings(':locales', [inbuiltDefaultLocale]),
                defaultLocale = supportedLocales[0] || inbuiltDefaultLocale; // first is the default
                
            // extend env (in global config) for locales related operations
            config.env.getLocale = () => { 
                let locale = '';
                if (!this.env.isServer) {
                    locale = sessionStorage.getItem('locale') || defaultLocale;
                } else {
                    let currentRequest = config.env.currentRequest();
                    locale = (currentRequest ? currentRequest.getLocale() : '') || defaultLocale;
                }
                let localeObj = localesList[locale];
                if (!localeObj) {
                    locale = inbuiltDefaultLocale;
                    localeObj =  inbuiltDefaultLocaleInfo;
                } 
                return localeObj;
            };
            config.env.getLocales = () => {
                let items = [],
                    item = null;
                for(let locale in localesList) {
                    if (localesList.hasOwnProperty(locale)) {
                        if (supportedLocales.indexOf(locale.name) !== -1) {
                            items.push(localesList[locale]);
                        }
                    }
                }
                return items;
            };

            // further extend env for client only
            if (!this.env.isServer) {
                config.env.setLocale = (locale, isSupressRefresh) => { 
                    if (localesList[locale] && supportedLocales.indexOf(locale) !== -1) {
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