define([
    use('[Base]'),
    use('[Automapper]') 
], (Base, Automapper) => {
    /**
     * @class sys.core.data.Entity
     * @classdesc sys.core.data.Entity
     * @desc Entity base.
     */    
    return Class('sys.core.data.Entity', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();
            this.automapper = new Automapper();
        });

        attr('protected');
        this.prop('automapper');

        this.func('toDTO', (dto) => { return this.automapper.to(this, dto); });
        this.func('fromDTO', (dto) => { return this.automapper.from(this, dto); });        
    });
});