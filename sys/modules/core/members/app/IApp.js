define(() => {
    /**
     * @interface sys.core.app.IApp
     * @classdesc sys.core.app.IApp
     * @desc App interface.
     */    
    return Interface('sys.core.app.IApp', function() {
        /**
         * @return {object} - promise object
         * @desc Runs anything that is required to execute now, when app is loaded and ready.
         */ 
        this.func('start');

        /**
         * @param {string} url - url to send to router
         * @return {void} - none
         * @desc Initiate routing for given url.
         */ 
        this.func('navigate');

        /**
         * @desc App level info defined to describe various aspects of app in app settings in config.json
         */ 
        this.prop('info');
    });
});