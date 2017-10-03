define(() => {
    /**
     * @class app.core.db.IDbClient
     * @classdesc app.core.db.IDbClient
     * @desc Database client interface.
     */    
    return Interface('app.core.db.IDbClient', function(attr) {
        this.prop('name');   

        this.func('conn');
        this.func('disconnect');

        this.func('beginTran');
        this.func('commitTran');
        this.func('rollbackTran');
    });
});