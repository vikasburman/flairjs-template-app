const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');

// generate env
const generateEnv = (isDev, isProd, isTest, asms, fileName) => {
    let fileContent = fs.readFileSync(fileName).toString();
    fileContent = fileContent.replace('[%]DATE[%]', (new Date()).toUTCString());
    fileContent = fileContent.replace('[%]DEV[%]', isDev.toString());
    fileContent = fileContent.replace('[%]PROD[%]', isProd.toString());
    fileContent = fileContent.replace('[%]TEST[%]', isTest.toString());
    fileContent = fileContent.replace('[%]PATHS[%]', JSON.stringify(asms.paths));
    fileContent = fileContent.replace('[%]BUNDLES[%]', JSON.stringify(asms.bundles));
    fs.writeFileSync(fileName, fileContent);
};
exports.generator = function(isDev, isProd, isTest, asms, cb) {
    // for client side loader file
    generateEnv(isDev, isProd, isTest, asms, 'sys/modules/core/static/loader.js');

    // for server side loader file
    generateEnv(isDev, isProd, isTest, asms, 'sys/loader.js');
        
    // done
    cb();
};