/**
 * Your App - Server
 * Your App Description
 * Copyright Message
 */
(async () => {
    const { AppDomain, include, env } = require('flairjs');
    const { BootEngine } = await include('flair.app.BootEngine');

    // load config 
    await AppDomain.config('./appConfig.json');

    // boot
    await BootEngine.start(env.isWorker ? '' : __filename);
 })();
 