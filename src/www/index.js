/**
 * Your App - Client
 * Your App Description
 * Copyright Message
 */
const __filename = (typeof document !== 'undefined' ? document.currentScript.src : ''); // to consider web worker env as well
require(['./modules/flairjs-fabric/flair.client/start.js'], (start) => {
    start(__filename, (flair, app) => {
        console.log('!'); // application is started now
    });
});
