define([
    use('[Base]'),
    use('sys.core.app.IApp')
], (Base, IApp) => {
    /**
     * @class sys.core.app.App
     * @classdesc sys.core.app.App
     * @desc App base class.
     */    
    return Class('sys.core.app.App', Base, [IApp], function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();
            
            this.appSettings = this.settings(':appSettings');
            this.title = this.appSettings.title;
            this.version = this.appSettings.version;
        });

        attr('readonly');
        this.prop('appSettings', null);

        attr('async');
        this.func('start', this.noopAsync);

        attr('async');
        this.func('auth', this.noopAsync);

        this.func('navigate', this.noop);

        attr('readonly');
        this.prop('title', '');    

        attr('readonly');
        this.prop('version', '');        
    });
});