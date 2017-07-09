define(() => {
    /**
     * @interface sys.core.IBootware
     * @classdesc sys.core.IBootware
     * @desc Bootware interface.
     */    
    return Interface('sys.core.IBootware', function() {
        this.func('boot');
        this.func('ready');
    });
});