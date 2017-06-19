define([
    use('[Base]')
], (Base) => {
    return Class('Application', Base, function(attr) {
        attr('async');
        this.func('start', (resolve, reject) => {
            resolve();
        });
    });
});