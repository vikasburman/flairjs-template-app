define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.bootwares.client.Dependencies
     * @classdesc sys.bootwares.client.Dependencies
     * @desc Load client-side dependencies.
     */    
    return Class('Dependencies', Base, function(attr) {
        this.assembly = 'sys.bootwares';

        attr('async');
        this.func('boot', (resolve, reject, app) => {
            let dependencies = this.settings('dependencies', []);

// TODO:  { flag: <func>, file: '<file>' } and then use include

            // load all dependencies
            for(let item of middlewares) {
                mw = require(item.name); // always node modules, so not using (use)
                if (item.args) {
                    app.use(mw(...item.args));
                } else {
                    app.use(mw()); 
                }
            }

            // dome
            resolve();
        });
    });
});