define(() => {
    /**
     * @interface sys.core.IApp
     * @classdesc sys.core.IApp
     * @desc App interface.
     */    
    return Interface('sys.core.IApp', function() {
        this.func('start');

        /**
         * @param {Request} request - current request object
         * @return {object} - promise object
         * @desc Authenticates and authorizes the current request as per given access information.
         */ 
        this.func('auth');
    });
});