define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.Automapper
     * @classdesc sys.core.data.Automapper
     * @desc Data entity to DTO/DBObject mapper and vice-versa.
     */    
    return Class('sys.core.data.Automapper', Base, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base();
            
            // set special variables
            let currentRequest = this.env.currentRequest();
            this.vars.$loginId = ((currentRequest && currentRequest.user) ? currentRequest.user.loginId : '');
            this.vars.$clientId = ((currentRequest && currentRequest.user) ? currentRequest.user.clientId : '');
            this.vars.$locale = this.env.getLocale().name;
            this.vars.$lcId = this.env.getLocale().lcId;
        });

        // map can be defined as:
        // {
        //      entityPropertyName1: - OR objectPropertyName-Or-Path OR ArrayOfNames-Or-Paths, <-- '-', 'key1' OR 'path.to.key1' OR ['*', 'key1', 'key2', 'path.to.key1', '...']
        //      entityPropertyName2: { ... }
        // }
        // notes: 
        // 1. absence of any entityPropertyName OR emptyString will skip mapping that property
        // 2. - means same name as of entity property name
        // 3. In path name, special variables can be used to be replaced as per context
        //    client.$clientId.path.to.key <-- $clientId will be replaced by current user's clientId
        //    user.$loginId.path.to.key <-- $loginId will be replaced by current user's loginId
        //    $clientId.$loginId.path.to.key <-- $clientId and $loginId will be replaced by current user's clientId and loginId respectively
        //    i18n.$locale.path.to.key <-- $locale will be replaced by current user's locale's name
        //    i18n.$lcId.path.to.key <-- $lcId will be replaced by current user's locale's lcid
        attr('once');
        this.prop('config', {});

        attr('private');
        this.prop('vars', {});

        attr('private');
        this.func('resolveObjectProp', (key) => {
            let prop = '',
                cfg = this.config[key];
            if (cfg) {
                if (cfg === '-') {
                    prop = key; // same
                } else {
                    if (cfg.indexOf('.') !== -1) { // path exist
                        if (cfg.indexOf('$') !== -1) { // special variables exists
                            for(let _var in this.vars) {
                                if (this.vars.hasOwnProperty(_var)) {
                                    cfg = cfg.replace(_var, this.vars[_var]);
                                }
                            }
                        }
                    }
                    prop = cfg; // prop as is OR path as is OR path with resolved variables
                }
            }

            return prop;
        });

        this.func('to', (toEntity, fromObject) => {
            // iterate config to work on mapping
            for(let key in this.config) {
                if (this.config.hasOwnProperty(key)) {
                    // mapping info
                    let e = {
                        direction: 'o2e',
                        entity: {
                            prop: key,
                            value: null
                        },
                        object: {
                            prop: this.resolveObjectProp(key),
                            value: null
                        }
                    };
                    e.entity.value = toEntity[e.entity.prop];
                    e.object.value = getNestedKeyValue(fromObject, e.object.prop, null);

                    if (e.object.prop) { // mapping configuration exists
                        // mapping interception
                        // values can be updated by map function (unrestricted)
                        if (typeof this.onMap === 'function') {
                            this.onMap(e);
                        }

                        // mapping
                        setNestedKeyValue(toEntity, e.entity.prop, e.object.value);
                    }
                }
            }
        });
        this.func('from', (fromEntity, toObject) => {
            // iterate config to work on mapping
            for(let key in this.config) {
                if (this.config.hasOwnProperty(key)) {
                    // mapping info
                    let e = {
                        direction: 'e2o',
                        entity: {
                            prop: key,
                            value: null
                        },
                        object: {
                            prop: this.resolveObjectProp(key),
                            value: null
                        }
                    };
                    e.entity.value = fromEntity[e.entity.prop];
                    e.object.value = getNestedKeyValue(toObject, e.object.prop, null);
                    

                    if (e.object.prop) { // mapping configuration exists
                        // mapping interception
                        // values can be updated by map function (unrestricted)
                        if (typeof this.onMap === 'function') {
                            this.onMap(e);
                        }

                        // mapping
                        setNestedKeyValue(toObject, e.object.prop, e.entity.value);
                    }
                }
            }
        });

        this.prop('onMap');
    });
});