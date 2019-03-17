/**
 * Your App - Client
 * Your App Description
 * Copyright Message
 */
(async () => {
    const flair = await include('./lib/flairjs/flair.min.js', 'flair');
    const { AppDomain, include, env } = flair;
    const { BootEngine } = await include('BootEngine');

    // load config 
    await AppDomain.config('./webConfig.json');

    // boot
    BootEngine.start(env.isWorker ? '' : document.currentScript);
 })();
 