const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const del = require('del');

exports.cleaner = function(isProd, isTest, cb) {
    let cleanGlob = buildSettings.globs.clean;
    for(let dir in buildSettings.source) {
        if (buildSettings.source.hasOwnProperty(dir)) {
            let folders = utils.getFolders(buildSettings.source[dir]),
                root = buildSettings.source[dir];
            for(folder of folders) {
                del.sync(utils.getSource(root, folder, ...cleanGlob));
            }
        }
    }

    // done
    cb();
};