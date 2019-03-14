/**
 * Your App - Server
 * Your App Description
 * Copyright Message
 */

(async () => {
    const flair = require('flairjs');
    const { AppDomain, include } = flair;

    // set config 
    let config = await AppDomain.config('./appConfig.json');

    // boot
    const BootEngine = await include(config.bootEngine);
    BootEngine.start(config.entryPoint);
 })();
 