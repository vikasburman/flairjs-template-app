const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs');
const deepAssign = require('deep-assign');

// generate configs
const generateConfig = (configFile, dirs, source) => {
    // 0: get everything from custom config
    let newConfig = Object.assign({}, JSON.parse(fs.readFileSync('config.json').toString()));

    // 1: add source path
    newConfig.settings = newConfig.settings || {};
    newConfig.settings.source = source;

    // 2: merge settings.json of all modules in config.json
    let configJSON = configFile;
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

    // 3: remove unwanted app/web keys (which have come because of them being defined
    //    in config.json)
    if (!source.app) {
        let keys = [];
        for(let key in newConfig) {
            if (newConfig.hasOwnProperty(key) && key.startsWith('app.')) {
                keys.push(key);
            } 
        }
        for(let key of keys) { delete newConfig[key]; }
    }
    if (!source.web) {
        let keys = [];
        for(let key in newConfig) {
            if (newConfig.hasOwnProperty(key) && key.startsWith('web.')) {
                keys.push(key);
            } 
        }
        for(let key of keys) { delete newConfig[key]; }
    }

    // 4: save this new config as sys/.config.json file to be used here
    fs.writeFileSync(configJSON, JSON.stringify(newConfig));

};
exports.generator = function(isDev, isProd, isTest, cb) {
    let configFile = '',
        dirs = [],
        source = {};

    // generate client side config
    configFile = 'sys/modules/core/static/.config.json',
    dirs = [
        'sys/modules/',
        'web/modules/'
    ],
    source = {
        sys: 'sys/modules/',
        web: 'web/modules/'
    };
    generateConfig(configFile, dirs, source);

    // generate server side config
    configFile = 'sys/.config.json',
    dirs = [
        'sys/modules/',
        'app/modules/',
    ],
    source = {
        sys: 'sys/modules/',
        app: 'app/modules/'
    };
    generateConfig(configFile, dirs, source);

    // a key part of config is that it gets embedded in loader.js
    // since we need a different version of config on server and client
    // we need a copy of loader.js; and for that we need two different copy of
    // same loader.js.tmpl with just the config file difference
    // Therefore, copy sys/loader.js.tmpl to sys/modules/static/loader.js.tmpl
    // and since injection is defined to pick from local path, it will pick current
    // folder's .congig.json
    fs.createReadStream('sys/loader.js.tmpl').pipe(fs.createWriteStream('sys/modules/core/static/loader.js.tmpl'));

    // done
    cb();
};