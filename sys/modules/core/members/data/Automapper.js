define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.Automapper
     * @classdesc sys.core.data.Automapper
     * @desc Data entity to DTO mapper and vice-versa.
     */    
    return Class('sys.core.data.Automapper', Base, function(attr) {
        attr('sealed');
        this.func('constructor', (entity, dto) => {
            this.entity = entity;
            this.dto = dto;
        });

        attr('private');
        this.prop('entity');
        
        attr('private');
        this.prop('dto');

        this.func('toDTO', () => {
        });
        this.func('toEntity', () => {
        });
    });
});