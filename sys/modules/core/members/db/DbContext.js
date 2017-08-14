define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.db.DbContext
     * @classdesc sys.core.db.DbContext
     * @desc DbContext for a database.
     */    
    return Class('sys.core.db.DbContext', Base, function(attr) {
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