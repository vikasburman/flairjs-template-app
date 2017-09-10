define([
    use('[Base]'),
    use('[IApp]'),
    use('[IStarter]')
], (Base, IApp, IStarter) => {
    /**
     * @class sys.core.app.App
     * @classdesc sys.core.app.App
     * @desc App base class.
     */    
    return Class('sys.core.app.App', Base, [IApp], function(attr) {
        attr('override');
        attr('abstract');
        this.func('constructor', (base) => {
            base();
            this.info = this.settings(':app');
        });

        attr('readonly');
        this.prop('info', {});    

        attr('sealed');
        attr('async');
        this.func('start', (resolve, reject) => {
            this.onStart().then(() => {
                let items = this.settings(':start', []),
                starters = [];
                for (let item of items) {
                    starters.push(use(item));
                }
                include(starters, true).then((Starters) => {
                    forAsync(Starters, (_resolve, _reject, Starter) => {
                        let starter = as(new Starter(), IStarter);
                         if (starter) {
                            xLog('debug', `${starter._.name}.start`);
                            starter.start();
                         } else {
                             xLog('debug', `${starter._.name} is not a starter.`);
                         }
                         _resolve();
                    }).then(resolve).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });

        attr('protected');
        attr('async');
        this.func('onStart', this.noopAsync);

        this.func('error', (err) => { this.onError(err); });
    });
});