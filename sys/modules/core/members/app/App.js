define([
    use('[Base]'),
    use('[IApp]')
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
            this.info = this.settings(':app');
        });

        attr('async');
        this.func('start', this.noopAsync);

        this.func('error', (err) => { this.onError(err); });

        attr('readonly');
        this.prop('info', {});    
    });
});