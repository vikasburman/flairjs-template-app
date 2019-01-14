(function() {
    // initialize flair
    flair();

    // load assembly definitions and then boot
    bring([
        './www/gears/ados.json | ./gears/ados.json',
        './ados.json',
        './www/ados.json | x'
    ], (gears, serverOrClientApp, clientApp) => {
        // register assemblies
        Assembly.register(gears, serverOrClientApp, clientApp);

        // start boot engine
        bring('gears.BootEngine', (BootEngine) => {
            new BootEngine().start();
        });
    });
}).call(this);