/**
 * Your App - Client
 * Your App Description
 * Copyright Message
 */
const __filename = (typeof document !== 'undefined' ? document.currentScript.src : ''); // to support web worker
require(['./modules/flairjs/flair.js'], (flair) => {
    flair(__filename, './webConfig.json').then((app) => {
        console.log('*');
    });
});

