define([
    use('[Base]'),
    use('[IBootware]')
], (Base, IBootware) => {
    /**
     * @class sys.core.bootwares.client.DataBinder
     * @classdesc sys.core.bootwares.client.DataBinder
     * @desc Load client-side data inding configuration.
     */    
    return Class('sys.core.bootwares.client.DataBinder', Base, [IBootware], function(attr) {
        attr('singleton');
        attr('override');
        this.func('constructor', (base) => {
            base();
        });

        attr('async');
        this.func('boot', (resolve, reject, app) => {
            // setup shim for require
            let shimFor = { name: 'rivets', path: 'sys/core/libs/rivets{.min}.js' },
                shimDeps = [{ name: 'sightglass', path: 'sys/core/libs/sightglass{.min}.js' }];
            this.env.addShim(shimFor, shimDeps);

            // load rivets
            include([use('rivets')]).then((rivets) => {
                // set
                this.rivets = rivets;

                // configuration
                let rivetsConfig = this.settings('rivets.config', null);
                if (rivetsConfig) {
                    rivets.configure(rivetsConfig);
                }

                // custom binders
                // TODO

                // done
                resolve();
            }).catch(reject);
        });

        attr('async');
        this.func('ready', this.noopAsync);

        attr('private');
        this.prop('rivets', null);

        this.func('bind', ($el, obj) => {
            return rivets.bind($el, obj);
        });
        this.func('unbind', (bindedView) => {
            bindedView.unbind();
        });
    });
});