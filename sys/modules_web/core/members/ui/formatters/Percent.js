define([
    use('[Formatter]')
], (Formatter) => {
    /**
     * @class web.core.ui.formatters.Percent
     * @classdesc web.core.ui.formatters.Percent
     * @desc Percent formatter, adds % symbol to given value.
     */    
    return Class('web.core.ui.formatters.Percent', Formatter, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base();
            this.formatterName = 'percent';
            this.isTwoWay = false;
        });

        attr('override');
        this.func('read', (base, value) => {
            base();
            return value + '%';
        });
    });
});