define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.domain.Controller
     * @classdesc sys.core.domain.Controller
     * @desc Controller base.
     */    
    return Class('sys.core.domain.Controller', Base, function(attr) {
        this.func('toDTO', (entity, Dto) => { return entity.toDTO(new Dto()); });
        this.func('toDTOList', (entities, Dto) => {
            let dtos = [];
            for(let entity of entities) {
                dtos.push(entity.toDTO(new Dto()));
            }
            return dtos;
        });
        this.func('fromDTO', (Entity, dto) => { 
            let entity = new Entity();
            return entity.fromDTO(dto);
        });
        this.func('fromDTOList', (Entity, dtos) => {
            let entities = [],
                entity = null;
            for(let dto of dtos) {
                entity = new Entity();
                entities.push(entity.fromDTO(dto));
            }
            return entities;            
        });
    });
});