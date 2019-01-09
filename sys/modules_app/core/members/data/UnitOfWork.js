define([
    use('[Base]')
], (Base) => {
    /**
     * @class app.core.data.UnitOfWork
     * @classdesc app.core.data.UnitOfWork
     * @desc UnitOfWork base.
     */    
    return Class('app.core.data.UnitOfWork', Base, function(attr) {
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