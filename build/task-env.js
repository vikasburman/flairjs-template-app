const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');

// generate env
const generateEnv = (isDev, isProd, isTest, asms, sysWebModules, sysAppModules, fileName) => {
    let fileContent = fs.readFileSync(fileName).toString();
    fileContent = fileContent.replace('[%]DATE[%]', (new Date()).toUTCString());
    fileContent = fileContent.replace('[%]DEV[%]', isDev.toString());
    fileContent = fileContent.replace('[%]PROD[%]', isProd.toString());
    fileContent = fileContent.replace('[%]TEST[%]', isTest.toString());
    fileContent = fileContent.replace('[%]PATHS[%]', JSON.stringify(asms.paths));
    fileContent = fileContent.replace('[%]BUNDLES[%]', JSON.stringify(asms.bundles));
    fileContent = fileContent.replace('[%]SYS_WEB[%]', JSON.stringify(sysWebModules));
    fileContent = fileContent.replace('[%]SYS_APP[%]', JSON.stringify(sysAppModules));
    fs.writeFileSync(fileName, fileContent);
};
exports.generator = function(isDev, isProd, isTest, asms, cb) {
    // generate a list of sysAppModules and sysWebModules 
    // (modules which are in sys/modules_app/ and sys/modules_web/ folder respectively)
    let sysWebModules = utils.getFolders('sys/modules_web/', true),
        sysAppModules = utils.getFolders('sys/modules_app/', true);

    // for client side loader file
    generateEnv(isDev, isProd, isTest, asms, sysWebModules, [], 'sys/modules_web/core/static/loader.js');

    // for server side loader file
    // on server side, webmodules are still to be provided, because
    // for use() may need to refer to web side modules as well for direct access to those
    // files on server side
    generateEnv(isDev, isProd, isTest, asms, sysWebModules, sysAppModules, 'sys/loader.js');

    // done
    cb();
};