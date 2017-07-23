define([
    use('[Shell]')
], (Shell) => {
    /**
     * @class web.sample.shells.Full
     * @classdesc web.sample.shells.Full
     * @desc Shell (fully loaded version).
     */
    return Class('web.sample.shells.Full', Shell, function(attr) {
        this.data('counter', 0);

        attr('override');
        attr('async');
        this.func('beforeShow', (base, resolve, reject) => {
            base().then(() => {
                this.sub('AddCounter', () => {
                    this.data.counter++;
                });        
                resolve();
            }).catch(reject);
        });
    });
});