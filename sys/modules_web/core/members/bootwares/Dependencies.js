define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class web.core.bootwares.Dependencies
     * @classdesc web.core.bootwares.Dependencies
     * @desc Load client-side dependencies.
     */    
    return Class('web.core.bootwares.Dependencies', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let dependencies = this.settings('dependencies', []),
                more = this.settings('more.dependencies', []);
            dependencies = dependencies.concat(more); 

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