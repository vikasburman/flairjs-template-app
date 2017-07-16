define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class sys.core.bootwares.client.Dependencies
     * @classdesc sys.core.bootwares.client.Dependencies
     * @desc Load client-side dependencies.
     */    
    return Class('sys.core.bootwares.client.Dependencies', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let dependencies = this.settings('dependencies', []);

            // load all dependencies
            // each definition is:
            // "path"
            // path: path of the dependency file
            let deps = [];
            for(let dep of dependencies) {
                deps.push(use(dep)); // resolve names
            }
            forAsync(deps, (resolve, reject, dep) => { 
                this.env.loadScript(dep).then(resolve).catch(reject);
            }).then(resolve).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);
    });
});