define([
    use('sys.core.ui.Formatter')
], (Formatter) => {
    /**
     * @class sys.core.ui.formatters.Percent
     * @classdesc sys.core.ui.formatters.Percent
     * @desc Percent formatter, adds % symbol to given value.
     */    
    return Class('sys.core.ui.formatters.Percent', Formatter, function(attr) {
        this.prop('name', 'percent');

        attr('override');
        this.func('read', (value) => {
            return value + '%';
        });
    });
});