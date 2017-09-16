define([
    use('[Base]'),
    use('[IBootware]'),
    use('localtunnel')
], (Base, IBootware, localtunnel) => {
    /**
     * @class app.core.bootwares.LocalTunnel
     * @classdesc app.core.bootwares.LocalTunnel
     * @desc Configure local tunnel for internet enabled local testing.
     */    
    return Class('app.core.bootwares.LocalTunnel', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', this.noopAsync);
        
        attr('async');
        this.func('ready', (resolve, reject, app) => {
            let tunnel = this.settings(':tunnel', ''),  // format is --> subdomain@host:port
                tunnelDefined = (tunnel !== ''),
                tunnelParts = tunnel.split('@'),
                tunnelSubDomain = tunnelParts[0] || '',
                tunnelHostParts = (tunnelParts[1] || '').split(':'),
                tunnelHost = tunnelHostParts[0] || '',
                tunnelPort = tunnelHostParts[1] || '';
            let enable = tunnelDefined || this.settings('localtunnel.enable', false),
                subdomain = tunnelSubDomain || this.settings('localtunnel.subdomain', ''),
                localhost = tunnelHost || this.settings('localtunnel.localhost', 'localhost'),
                port = tunnelPort || this.settings('localtunnel.port', '8080');

            // start
            if (enable) {
                let opts = {};
                if (subdomain) { opts.subdomain = subdomain; }
                if (localhost) { opts.local_host = localhost; }
                localtunnel(port, opts, (err, tunnel) => {
                    if (err) {
                        xLog('debug', `Localtunnel failed: ${err}`);
                    } else {
                        let url = tunnel.url;
                        xLog('debug', `Localtunnel activated: ${url}`);
                        tunnel.on('close', function() {
                            xLog('debug', `Localtunnel closed: ${url}`);
                        });                
                    }

                    // done
                    resolve();
                });
            } else {
                // done
                resolve();
            } 
        });
    });
});