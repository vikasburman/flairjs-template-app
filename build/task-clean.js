const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const del = require('del');

exports.cleaner = function(isDev, isProd, isTest, cb) {
    let cleanGlob = [
        '/**/*.asm.js', 
        '/**/*.asm.min.js'
    ],
    dirs = [
        'sys/modules/',
        'web/modules/',
        'app/modules/'
    ];    
    for(let dir of dirs) {
        let folders = utils.getFolders(dir),
            root = dir;
        for(folder of folders) {
            del.sync(utils.getSource(root, folder, ...cleanGlob));
        }
    }

    // done
    cb();
};