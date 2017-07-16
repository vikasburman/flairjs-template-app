define([
    use('[Base]'),
    use('sys/core/libs/rivets{.min}.js')
], (Base, rivets) => {
    /**
     * @class sys.core.ui.Adapter
     * @classdesc sys.core.ui.Adapter
     * @desc Adapter base class to define custom adapters for rivets.
     */    
    return Class('sys.core.ui.Adapter', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();

            // validate
            if (!this.name) { throw `Adapter name is not defined. (${this._.name})`; }

            // define adapter
            if (!rivets.adapters[this.name]) {
                rivets.adapters[this.name] = {
                    observe: this.observe,
                    unobserve: this.unobserve,
                    get: this.get, 
                    set: this.set
                };
            }
        });

        this.prop('name', '');
        this.func('observe', this.noop);
        this.func('unobserve', this.noop);
        this.func('get', this.noop);
        this.func('set', this.noop);
    });
});