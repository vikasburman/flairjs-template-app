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
         * @param {Request} request - current request object
         * @return {object} - promise object
         * @desc Authenticates and authorizes the current request as per given access information.
         */ 
        this.func('auth');

        /**
         * @param {string} url - url to send to router
         * @return {void} - none
         * @desc Initiate routing for given url.
         */ 
        this.func('navigate');

        this.prop('title');
        this.prop('version');
    });
});