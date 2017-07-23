define([
    use('[Partial]')
], (Partial) => {
    /**
     * @class web.console.partials.CBItem
     * @classdesc web.console.partials.CBItem
     * @desc Item details of a chatbot.
     */
    return Class('web.console.partials.CBItem', Partial, function() {
        this.data('slug', '');
        this.data('img', '');
        this.data('desc', '');
        this.data('details', '');
        this.data('url', '');
        this.data('tags', '');
        this.data('isSpecial', false);
        this.data('isProtected', false);
        this.data('isAvailable', false);
    });
});