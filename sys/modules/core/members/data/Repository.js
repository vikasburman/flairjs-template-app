define([
    use('[Base]'),
    use('[Automapper]')
], (Base, Automapper) => {
    /**
     * @class sys.core.data.Repository
     * @classdesc sys.core.data.Repository
     * @desc Repository base.
     */    
    return Class('sys.core.data.Repository', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, dbContext) => {
            base();
            this.dbContext = dbContext;
            this.automapper = new Automapper();
        });

        attr('protected');
        this.prop('dbContext');

        attr('protected');
        this.prop('automapper');

        this.func('toEntity', (Entity, dbObject) => { 
            let entity = new Entity();
            this.automapper.to(entity, dbObject);
            return entity;
        });
        this.func('toEntityList', (Entity, dbObjects) => { 
            let entities = [];
            for(let dbObject of dbObjects) {
                entities.push(this.toEntity(Entity, dbObject));
            }
            return entities;
        });
        this.func('fromEntity', (entity) => { 
            let object = {};
            this.automapper.from(entity, object); 
            return object;
        });
        this.func('fromEntityList', (entities) => { 
            let dbObjects = [];
            for(let entity of entities) {
                dbObjects.push(this.fromEntity(entity));
            }
            return dbObjects;
        });
    });
});