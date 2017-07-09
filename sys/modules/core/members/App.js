define([
    use('sys.core.Base'),
    use('sys.core.IApp')
], (Base, IApp) => {
    /**
     * @class sys.core.App
     * @classdesc sys.core.App
     * @desc App base class.
     */    
    return Class('sys.core.App', Base, [IApp], function(attr) {
        attr('abstract');
        this.func('constructor', () => {
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

        attr('readonly');
        this.prop('title', '');    

        attr('readonly');
        this.prop('version', '');        
    });
});