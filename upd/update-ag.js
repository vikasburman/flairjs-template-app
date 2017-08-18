const utils = require('../build/utils.js');
const buildSettings = require('../build/.build.json');
const fs = require('fs-extra');
const downloader = require('download-github-repo');
const packageJson = require('../package.json');
const prompt = require('prompt');

// update appgears files
const updateBP = () => {
    let repo = 'vikasburman/appgears#master',
        tempFolder = './temp.download',
        folders = [
            'app/modules/sample',
            'web/modules/sample',
            'build',
            'sys'
        ],
        files = [
            'gulpfile.js',
            'upd/update-oojs.js',
            'upd/update-ag.js'
        ];

    let onDone = () => {
        // delete temp folder
        fs.removeSync(tempFolder);
    };
    
    // create temp folder
    fs.ensureDirSync(tempFolder);

    // download repo
    downloader(repo, tempFolder, (e) => {
        if (e) {
            console.log(e);
            onDone();
        } else {
            // copy all folders as is from downloaded to here (after deleting)
            let tempName = '';
            for(let folder of folders) {
                fs.removeSync(folder);
                tempName = tempFolder + '/' + folder;
                console.log('updating: ' + tempName + ' --> ' + folder);
                fs.copySync(tempName, folder);
            };

            // copy all files as is from downloaded to here
            for(let file of files) {
                tempName = tempFolder + '/' + file;
                console.log('updating: ' + tempName + ' --> ' + file);
                fs.createReadStream(tempName).pipe(fs.createWriteStream(file));
            };

            // update package json
            let repoPackageJson = require('.' + tempFolder + '/package.json'), // one level back
                added = 0;
            for(let dep in repoPackageJson.devDependencies) {
                if (repoPackageJson.devDependencies.hasOwnProperty(dep)) {
                    if (typeof packageJson.devDependencies[dep] === 'undefined') {
                        packageJson.devDependencies[dep] = repoPackageJson.devDependencies[dep];
                        added++;
                    }
                }
            }
            for(let dep in repoPackageJson.dependencies) {
                if (repoPackageJson.dependencies.hasOwnProperty(dep)) {
                    if (typeof packageJson.dependencies[dep] === 'undefined') {
                        packageJson.dependencies[dep] = repoPackageJson.dependencies[dep];
                        added++;
                    }
                }
            }
            packageJson.agversion = repoPackageJson.version; // update framework version
            fs.writeJSONSync('./package.json', packageJson, {
                spaces: '\t'
            });
            if (added > 0) {
                console.log(added + ' packages added in package.json. Run yarn install to add these new dependencies.');
            } else {
                console.log('No new dependency is found.');
            }

            // done
            onDone();
        }
    });
};
const updater = function() {
    if (packageJson.name === 'appgears') {
        console.log('IMPORTANT: This update cannot be executed in appgears development environment. Aborted!');
    } else {
        console.log('This will update only following from appgears repository. Are you sure you want to do it? Type "yes" to continue.');
        console.log('app/sample/**');
        console.log('web/sample/**');
        console.log('sys/**');
        console.log('build/**');
        console.log('gulpfile.js');
        console.log('upd/update-ag.js');
        console.log('upd/update-oojs.js');
        console.log('package.json - to add any missing packages (it does not remove any package)');
        prompt.start();
        prompt.get(['response'], function (err, result) {
            if (result.response === 'yes') {
                updateBP();
            } else {
                console.log('Aborted!');
            }
        });
    }
};
updater();