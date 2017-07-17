const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');
const deepAssign = require('deep-assign');

// generate config
const generateConfig = () => {
    // 0: get everything from custom config
    let newConfig = Object.assign({}, JSON.parse(fs.readFileSync('config.json').toString()));

    // 1: add source path
    newConfig.settings = newConfig.settings || {};
    newConfig.settings.source = {
        sys: 'sys/modules/',
        web: 'web/modules/',
        app: 'app/modules/'
    };

    // 2: merge settings.json of all modules in config.json
    let dirs = [
        'sys/modules/',
        'web/modules/',
        'app/modules/'
    ],
    configJSON = 'sys/modules/core/www/.config.json';
    for(let dir of dirs) {
        let folders = utils.getFolders(dir, true),
            root = dir, 
            asm = '',
            settingsFile = '',
            settings = null;
        for(folder of folders) {
            settingsFile = root + folder + '/settings.json';
            asm = (root + folder).replace('modules/', '').split('/').join('.'); // sys/modules/core becomes sys.core
            if (fs.existsSync(settingsFile)) {
                settings = require('../' + settingsFile);
                if (!newConfig[asm]) { // asm config is not defined in config
                    newConfig[asm] = {};
                }
                newConfig[asm] = deepAssign(settings, newConfig[asm]);
            }
        }
    }

    // 3: save this new config as sys/.config.json file to be used here
    fs.writeFileSync(configJSON, JSON.stringify(newConfig));

    // return
    return newConfig;
};
exports.generator = function(isDev, isProd, isTest, cb) {
    generateConfig();

    // done
    cb();
};