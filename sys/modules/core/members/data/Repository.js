define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.Repository
     * @classdesc sys.core.data.Repository
     * @desc Data repository.
     */    
    return Class('sys.core.data.Repository', Base, function(attr) {
        attr('abstract');
        this.func('constructor', (db) => {
            this.db = db;
        });

        attr('protected');
        this.prop('db');
    });
});