const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const fs = require('fs');

// delete generated config
const deleteGenerateConfig = () => {
    // delete this new config from sys/.config.json file to be used here
    fs.unlinkSync(buildSettings.source.sys + '.config.json');
};
exports.trasher = function(isProd, isTest, cb) {
    deleteGenerateConfig();

    // done
    cb();
};