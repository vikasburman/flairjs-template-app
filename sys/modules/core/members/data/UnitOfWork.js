define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.UnitOfWork
     * @classdesc sys.core.data.UnitOfWork
     * @desc UnitOfWork base.
     */    
    return Class('sys.core.data.UnitOfWork', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, dbContext) => {
            base();
            this.dbContext = dbContext;
        });

        attr('protected');
        this.prop('dbContext');
    });
});