define([
    use('sys.core.ui.Partial')
], (Partial) => {
    /**
     * @class web.sample.partials.SimpleList
     * @classdesc web.sample.partials.SimpleList
     * @desc SimpleList partial.
     */
    return Class('web.sample.partials.SimpleList', Partial, function(attr) {

        attr('protected');
        attr('override');
        attr('async');
        this.func('beforeShow', (base, resolve, reject) => {
            this.setData(this.args);
            resolve();
        });
        this.data('abc', 0);
        this.data('xyz', 0);
    });
});