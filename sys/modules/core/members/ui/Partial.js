define([
    use('sys.core.ui.Component')
], (Component) => {
    /**
     * @class sys.core.ui.Partial
     * @classdesc sys.core.ui.Partial
     * @desc Partial base class.
     */    
    return Class('sys.core.ui.Partial', Component, function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base, parent, $host, args) => {
            base('partial', parent, args);
            this.$host = $host;
        });
    });
});