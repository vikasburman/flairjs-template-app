const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');

// delete generated config
const deleteGenerateConfig = () => {
    // delete this new config from sys/.config.json file to be used here
    let configJSON = 'sys/modules/core/www/.config.json';
    fs.unlinkSync(configJSON);
};
exports.trasher = function(isDev, isProd, isTest, cb) {
    deleteGenerateConfig();

    // done
    cb();
};