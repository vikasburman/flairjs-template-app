define([
    use('[Base]')
], (Base) => {
    return Class('Client', Base, function(attr) {
        attr('async');
        this.func('boot', (resolve, reject) => {
            resolve();
        });

        attr('async');
        this.func('ready', (resolve, reject) => {
            resolve();
        });

    });
});