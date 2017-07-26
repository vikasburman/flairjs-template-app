const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs-extra');
const https = require("https");
const prompt = require('prompt');
const packageJson = require('../package.json');

// update OOJS library
const updateFile = (src, dest, tempFolder, fileName, onDone) => {
    let tempFileName = tempFolder + '/' + fileName,
        tempFile = fs.createWriteStream(tempFileName);

    // download file in temp folder    
    https.get(src + fileName, (res) => {
        res.pipe(tempFile);

        // update
        try {
            let targetFileName = dest + fileName;
            console.log('updating: ' + tempFileName + ' --> ' + targetFileName);
            fs.createReadStream(tempFileName).pipe(fs.createWriteStream(targetFileName));
            onDone(true);
        } catch (e) {
            console.log(e);
            onDone(false);
        }
    }).on('error', (e) => {
        console.log(e);
        onDone(false);
    });
    
};
const updateOOJS = (cb) => {
    // delete this new config from sys/.config.json file to be used here
    let srcRepo = 'https://raw.githubusercontent.com/vikasburman/oojs/master/src/',
        destFolder = 'sys/modules/core/www/libs/',
        tempFolder = 'temp.download',
        files = [
            'oojs.js',
            'oojs.min.js'
        ];
    
    // create temp folder
    fs.ensureDirSync(tempFolder);

    let onDone = () => {
        // delete temp folder
        fs.removeSync(tempFolder);

        // done
        cb(); 
    };

    let updFile = () => {
        if (files.length > 0) {
            let fileName = files.shift();
            updateFile(srcRepo, destFolder, tempFolder, fileName, (success) => {
                if (success) { 
                    updFile();
                } else {
                    onDone();
                }
            });
        } else {
            onDone();
        }
    };
    updFile();
};
exports.updater = function(isDev, isProd, isTest, cb) {
    if (packageJson.name !== 'appgears') {
        console.log('IMPORTANT: This update can be executed only in appgears development environment. Aborted!');
        cb();
    } else {
        console.log('This will update two key files of OOJS library from OOJS repository. Are you sure you want to do it? Type "yes" to continue.');
        prompt.start();
        prompt.get(['response'], function (err, result) {
            if (result.response === 'yes') {
                updateOOJS(cb);
            } else {
                console.log('Aborted!');
                cb();
            }
        });
    }
};