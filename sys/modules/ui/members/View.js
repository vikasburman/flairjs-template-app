define([
    use('[Base]')
], (Base) => {
    /**
     * @class sys.core.ui.View
     * @classdesc sys.core.ui.View
     * @desc Base class for all view classes.
     */
    return Class('sys.core.ui.View', Base, function(attr) {
        this.func('constructor', (url, args) => {
            this.url = url;
            this.args = args;
        });

        attr('protected');
        this.prop('url', '');

        attr('protected');
        this.prop('args', null);

        attr('async');
        this.func('view', () => {
            // TODO: initiate view showing
        });

        this.func('show', () => {
            // TODO:
        });
        this.func('hide', () => {
            // TODO:
        });

        this.func('beforeShow', () => {
        });
        this.func('afterShow', () => {
        });
        this.func('beforeHide', () => {
        });
        this.func('afterHide', () => {
        });
        this.func('refresh', () => {
        });
    });
});