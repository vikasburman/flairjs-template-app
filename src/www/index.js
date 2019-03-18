/**
 * Your App - Client
 * Your App Description
 * Copyright Message
 */
(async () => {
    const { AppDomain, include, env } = flair;
    const page = await include('page/page.js', 'page');
    const { BootEngine } = await include('flair.app.BootEngine');

    // load config 
    await AppDomain.config('./webConfig.json');

    // boot
    BootEngine.start(env.isWorker ? '' : env.global.document.currentScript);
 })();
 