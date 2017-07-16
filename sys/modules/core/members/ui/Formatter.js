define([
    use('[Base]'),
    use('sys/core/libs/rivets{.min}.js')
], (Base, rivets) => {
    /**
     * @class sys.core.ui.Formatter
     * @classdesc sys.core.ui.Formatter
     * @desc Formatter base class to define custom formatters for rivets.
     */    
    return Class('sys.core.ui.Formatter', Base, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();

            // validate
            if (!this.name) { throw `Formatter name is not defined. (${this._.name})`; }

            // define formatter
            if (!rivets.formatters[this.name]) {
                if (!this.isTwoWay) { // one-way formatter
                    rivets.formatters[this.name] = this.read;
                } else { // two-way formatter
                    rivets.formatters[this.name] = {
                        read: this.read,
                        publish: this.publish
                    };
                }                        
            }
        });

        this.prop('name', '');
        this.func('read', this.noop);
        this.func('publish', this.noop);
        this.func('isTwoWay', false);
    });
});