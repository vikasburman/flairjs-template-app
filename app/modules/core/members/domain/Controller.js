define([
    use('[Base]')
], (Base) => {
    /**
     * @class app.core.domain.Controller
     * @classdesc app.core.domain.Controller
     * @desc Controller base.
     */    
    return Class('app.core.domain.Controller', Base, function(attr) {
        attr('protected');
        this.func('toDTO', (entity, Dto) => { 
            let dtoObject = entity.toDTO(entity, new Dto());
            return Serializer.serialize(dtoObject); // plain json object
        });

        attr('protected');
        this.func('toDTOList', (entities, Dto) => {
            let dtos = [],
                dtoObject = null;
            for(let entity of entities) {
                dtoObject = entity.toDTO(entity, new Dto());
                dtos.push(Serializer.serialize(dtoObject));
            }
            return dtos;
        });

        attr('protected');
        this.func('fromDTO', (Entity, dto) => { 
            let entity = new Entity();
            return entity.fromDTO(entity, dto);
        });

        attr('protected');
        this.func('fromDTOList', (Entity, dtos) => {
            let entities = [],
                entity = null;
            for(let dto of dtos) {
                entity = new Entity();
                entities.push(entity.fromDTO(entity, dto));
            }
            return entities;            
        });
    });
});