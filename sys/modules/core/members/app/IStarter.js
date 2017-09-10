define(() => {
    /**
     * @interface sys.core.app.IStarter
     * @classdesc sys.core.app.IStarter
     * @desc Starter interface.
     */    
    return Interface('sys.core.app.IStarter', function() {
        /**
         * @return {object} - promise object
         * @desc Runs anything that is required to execute now, when app is loaded and ready.
         */ 
        this.func('onStart');
    });
});