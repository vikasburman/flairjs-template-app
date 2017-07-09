const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const fs = require('fs');

// generate env
const generateEnv = (isProd, isTest, asms) => {
    let fileName = buildSettings.source.syswww + 'loader.js',
        fileContent = fs.readFileSync(fileName).toString();
    fileContent = fileContent.replace('[%]PROD[%]', isProd.toString());
    fileContent = fileContent.replace('[%]TEST[%]', isTest.toString());
    fileContent = fileContent.replace('[%]PATHS[%]', JSON.stringify(asms.paths));
    fileContent = fileContent.replace('[%]BUNDLES[%]', JSON.stringify(asms.bundles));
    fs.writeFileSync(fileName, fileContent);
};
exports.generator = function(isProd, isTest, asms, cb) {
    generateEnv(isProd, isTest, asms);

    // done
    cb();
};