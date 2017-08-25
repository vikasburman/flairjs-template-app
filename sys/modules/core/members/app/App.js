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
            this.info = this.settings(':app');
        });

        attr('async');
        this.func('start', this.noopAsync);

        this.func('navigate', (url) => {
            xLog('debug', `navigate: ${url}`);
        });

        attr('readonly');
        this.prop('info', {});    
    });
});