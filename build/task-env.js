const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');

// generate env
const generateEnv = (isDev, isProd, isTest, asms) => {
    let fileName = 'sys/modules/core/www/loader.js',
        fileContent = fs.readFileSync(fileName).toString();
    fileContent = fileContent.replace('[%]DEV[%]', isDev.toString());
    fileContent = fileContent.replace('[%]PROD[%]', isProd.toString());
    fileContent = fileContent.replace('[%]TEST[%]', isTest.toString());
    fileContent = fileContent.replace('[%]PATHS[%]', JSON.stringify(asms.paths));
    fileContent = fileContent.replace('[%]BUNDLES[%]', JSON.stringify(asms.bundles));
    fs.writeFileSync(fileName, fileContent);
};
exports.generator = function(isDev, isProd, isTest, asms, cb) {
    generateEnv(isDev, isProd, isTest, asms);

    // done
    cb();
};