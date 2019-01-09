const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');

// delete generated config
const deleteGenerateConfig = (configFile) => {
    // delete this new config from sys/.config.json file to be used here
    fs.unlinkSync(configFile);
};
exports.trasher = function(isDev, isProd, isTest, cb) {
    // delete client side temp version
    configFile = 'sys/modules_web/core/static/.config.json';
    deleteGenerateConfig(configFile);

    // delete server side temp version
    configFile = 'sys/.config.json';
    deleteGenerateConfig(configFile);

    // done
    cb();
};