/**
 * Your App - Client
 * Your App Description
 * Copyright Message
 */
const __filename = (typeof document !== 'undefined' ? document.currentScript.src : ''); // to consider web worker env as well
require(['./modules/flairjs/flair.js'], (flair) => {
    flair(__filename).then((app) => {
        console.log('*');
    });
});

