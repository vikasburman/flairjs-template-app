define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.DbContext
     * @classdesc sys.core.data.DbContext
     * @desc DbContext for a database.
     */    
    return Class('sys.core.data.DbContext', Base, function(attr) {
        attr('override');
        this.func('constructor', (base, db) => {
            base();
            this.db = db;
        });

        attr('readonly');
        this.prop('db');

        attr('readonly');
        this.prop('tran', {
            begin: () => { this.db.beginTran(); },
            commit: () => { this.db.commitTran(); },
            rollback: () => { this.db.rollbackTran(); }
        });
    });
});