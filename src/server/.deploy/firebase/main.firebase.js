(async () => {
    const functions = require("firebase-functions");
    const mainApp = await require('./main.js');
    module.exports = functions.https.onRequest(mainApp);
})();
