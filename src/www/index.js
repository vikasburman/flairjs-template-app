/**
 * Your App - Client
 * Your App Description
 * Copyright Message
 */

(async () => {
    const flair = await include('./lib/flairjs/flair.min.js', 'flair');
    const { AppDomain, include } = flair;

    // set config 
    let config = await AppDomain.config('./webConfig.json');

    // boot
    const BootEngine = await include(config.bootEngine);
    BootEngine.start(config.entryPoint);
 })();
 