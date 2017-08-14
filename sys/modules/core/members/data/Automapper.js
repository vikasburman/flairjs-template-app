define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.data.Automapper
     * @classdesc sys.core.data.Automapper
     * @desc Data entity to DTO/DBObject mapper and vice-versa.
     */    
    return Class('sys.core.data.Automapper', Base, function(attr) {
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

        this.func('to', (toEntity, fromObject) => {
            // TODO:
            // onMap is called with: type, name, source, destination for each map activity
            return toEntity;
        });
        this.func('from', (fromEntity, toObject) => {
            // TODO:
            // onMap is called with: type, name, source, destination for each map activity
            return toObject;
        });

        this.prop('onMap');
    });
});