const utils = require('./utils.js');
const buildSettings = require('../.build.json');
const fs = require('fs');

// generate config
const generateConfig = () => {
    // 0: get everything from custom config
    let newConfig = Object.assign({}, JSON.parse(fs.readFileSync('config.json').toString()));

    // 1: add "source" definition
    newConfig.source = buildSettings.source;

    // 2: merge catalog, container and settings keys on top, to fill-in any undefined keys
    for(let dir in buildSettings.source) {
        if (buildSettings.source.hasOwnProperty(dir)) {
            let folders = utils.getFolders(buildSettings.source[dir], true),
                root = buildSettings.source[dir], 
                asm = '',
                settingsFile = '',
                settings = null;
            for(folder of folders) {
                asm = (root + folder).replace('/', '.'); // sys/core becomes sys.core
                settingsFile = root + folder + '/settings.json';
                if (fs.existsSync(settingsFile)) {
                    settings = require('../' + settingsFile);
                    if (!newConfig[asm]) { // asm config is not defined in config
                        newConfig[asm] = {};
                    }
                    for(let rootKey in settings) { // catalog, cotainer, routes, settings or something else
                        if (settings.hasOwnProperty(rootKey)) {
                            if (!newConfig[asm][rootKey]) {
                                newConfig[asm][rootKey] = {};
                            }
                            for(let key in settings[rootKey]) {
                                if (settings[rootKey].hasOwnProperty(key)) {
                                    if (!newConfig[asm][rootKey][key]) {
                                        newConfig[asm][rootKey][key] = settings[rootKey][key];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 3: save this new config as sys/.config.json file to be used here
    fs.writeFileSync(buildSettings.source.syswww + '.config.json', JSON.stringify(newConfig));

    // return
    return newConfig;
};
exports.generator = function(isProd, isTest, cb) {
    generateConfig();

    // done
    cb();
};