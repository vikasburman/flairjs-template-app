define([
    use('[Base]'),
    use('sys/core/libs/rivets{.min}.js')
], (Base, rivets) => {
    /**
     * @class sys.core.ui.Binder
     * @classdesc sys.core.ui.Binder
     * @desc Binder base class to define custom binders for rivets.
     */    
    return Class('sys.core.ui.Binder', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();

            // validate
            if (!this.name) { throw `Binder name is not defined. (${this._.name})`; }

            // define binder
            if (!rivets.binders[this.name]) {
                if (!this.isTwoWay) { // one-way binder
                    rivets.binders[this.name] = this.routine;
                } else { // two-way binder
                    rivets.binders[this.name] = {
                        bind: this.bind,
                        unbind: this.unbind,
                        routine: this.routine, 
                        getValue: this.getValue,
                        publishes: this.publishes,
                        block: this.block
                    };
                }                        
            }
        });

        this.prop('name', '');
        this.func('bind', this.noop);
        this.func('unbind', this.noop);
        this.func('routine', this.noop);
        this.func('getValue', this.noop);
        this.func('isTwoWay', false);
        this.prop('publishes', false);
        this.prop('block', false);
    });
});