const utils = require('./utils.js');
const buildSettings = require('./.build.json');
const fs = require('fs-extra');
const downloader = require('download-github-repo');
const packageJson = require('../package.json');
const prompt = require('prompt');

// update oojs files
const updateOOJS = (cb) => {
    let repo = 'vikasburman/oojs#master',
        tempFolder = './temp.download',
        srcFolder = 'src/',
        destFolder = 'sys/modules/core/static/libs/',
        files = [
            'oojs.js',
            'oojs.min.js'
        ];

    let onDone = () => {
        // delete temp folder
        fs.removeSync(tempFolder);

        // done
        cb(); 
    };
    
    // create temp folder
    fs.ensureDirSync(tempFolder);

    // download repo
    downloader(repo, tempFolder, (e) => {
        if (e) {
            console.log(e);
            onDone();
        } else {
            // copy all files as is from downloaded to here
            for(let file of files) {
                tempName = tempFolder + '/' + srcFolder + file;
                console.log('updating: ' + tempName + ' --> ' + destFolder + file);
                fs.createReadStream(tempName).pipe(fs.createWriteStream(destFolder + file));
            };

            // done
            onDone();
        }
    });
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