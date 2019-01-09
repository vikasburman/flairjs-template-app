define(() => {
    /**
     * @interface sys.core.boot.IBootware
     * @classdesc sys.core.boot.IBootware
     * @desc Bootware interface.
     */    
    return Interface('sys.core.boot.IBootware', function() {
        this.func('boot');
        this.func('ready');
    });
});