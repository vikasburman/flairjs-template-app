define([
    use('sys.core.ui.Shell')
], (Shell) => {
    /**
     * @class web.sample.shells.Full
     * @classdesc web.sample.shells.Full
     * @desc Shell (fully loaded version).
     */
    return Class('web.sample.shells.Full', Shell, function(attr) {
        attr('override');
        this.func('constructor', (base) => {
            base('index.html', 'Full');
        });
    });
});