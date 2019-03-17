/**
 * Your App - Server
 * Your App Description
 * Copyright Message
 */
(async () => {
    const flair = require('flairjs');
    const { AppDomain, include, env } = flair;
    const { BootEngine } = await include('BootEngine');

    // load config 
    await AppDomain.config('./appConfig.json');

    // boot
    await BootEngine.start(env.isWorker ? '' : __filename);
 })();
 