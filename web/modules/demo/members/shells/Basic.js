define([
    use('[Shell]')
], (Shell) => {
    /**
     * @class web.demo.shells.Basic
     * @classdesc web.demo.shells.Basic
     * @desc Basic shell without any content.
     */
    return Class('web.demo.shells.Basic', Shell, function() {
        this.data('version', App.tags.edition + ' v' + App.tags.version + ' (' + this.env.lupdate + ')');
        this.data('tagline', App.tags.tagline);
        this.data('copyright', App.tags.copyright);
        this.data('desc', App.tags.desc);
        this.data('url', App.tags.url);
        this.data('org', App.tags.org);
    });
});