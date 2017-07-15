define([
    use('sys.core.ui.Partial')
], (Partial) => {
    /**
     * @class web.sample.partials.SimpleList
     * @classdesc web.sample.partials.SimpleList
     * @desc SimpleList partial.
     */
    return Class('web.sample.partials.SimpleList', Partial, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base('index.html', 'Simple List');
        });
    });
});