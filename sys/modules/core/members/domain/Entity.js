define([
    use('[Base]'),
    use('[Automapper]') 
], (Base, Automapper) => {
    /**
     * @class sys.core.domain.Entity
     * @classdesc sys.core.domain.Entity
     * @desc Entity base.
     */    
    return Class('sys.core.domain.Entity', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();
            this.automapper = new Automapper();
        });

        attr('private');
        this.prop('rules', []);

        attr('protected');
        this.prop('automapper');

        attr('protected');
        this.func('rule', (name, fn) => {
            let rule = {
                name: name, 
                validate: fn
            }
            this.rules.push(rule);
        });

        this.func('toDTO', (entity, dto) => { 
            this.automapper.from(entity, dto); 
            return dto;
        });
        this.func('fromDTO', (entity, dto) => { 
            this.automapper.to(entity, dto);
            entity.validate(); // this will throw, if error
            return entity;
        });
        this.func('validate', () => {
            let error = '';
            for(let rule of this.rules) {
                error = rule.validate();
                if (error) { 
                    throw `Rule ${rule.name} failed. (${error}).`;
                }
            }
        });
    });
});