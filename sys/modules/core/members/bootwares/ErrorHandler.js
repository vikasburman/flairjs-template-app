define([
    use('[Base]'),
    use('[IBootware]'),
    use('[ErrorInfo]')
], (Base, IBootware, ErrorInfo) => {
    /**
     * @class sys.core.bootwares.ErrorHandler
     * @classdesc sys.core.bootwares.ErrorHandler
     * @desc Configure server and client global error handlers.
     */    
    return Class('sys.core.bootwares.ErrorHandler', Base, [IBootware], function(attr) {
        attr('async');
        this.func('boot', (resolve, reject, app) => {
            if (this.env.isServer) {
                // catch 404 and forward to error handler
                app.use((req, res, next) => {
                    var err = new Error('Not Found: ' + req.url);
                    err.status = 404;
                    next(err);
                });

                // error handlers
                if (this.env.isProd) {
                    app.use((err, req, res, next) => {
                        res.status(err.status || 500);
                        err.stack = ''; // exclude stacktrace
                        next(err);
                    });
                } else {
                    app.use((err, req, res, next) => {
                        res.status(err.status || 500);
                        next(err);
                    });
                }
            }

            // dome
            resolve();
        });

        attr('async');
        this.func('ready', (resolve, reject) => {
            if (!this.env.isServer) {
                // setup global error handler
                window.onerror = function(desc, url, line, col, err) {
                    this.onError(new ErrorInfo('fatal_error', desc + ' at: ' + url + ', ' + line + ':' + col, '', err));
                };

                // global requirejs error handler
                require.onError = function(err) {
                    this.onError(new ErrorInfo(err));
                };  
            }

            // done
            resolve();
        });        
    });
});