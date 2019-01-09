const utils = require('../build/utils.js');
const buildSettings = require('../build/.build.json');
const fs = require('fs-extra');
const GitHubDownloader = require('download-github-repo');
const GitLabDownloader = require('gitlab-download');
const packageJson = require('../package.json');
const prompt = require('prompt');

const copyFolders = (tempFolder, cfgJson) => {
    // copy all folders as is from downloaded to here (after deleting)
    let src = '',
        dest = '';
    for(let folder of cfgJson.update.folders) {
        src = tempFolder + '/' + folder.src;
        dest = folder.dest || folder.src; // when src and dest are actually same at different root path
        console.log('updating folder: ' + src + ' --> ' + dest);
        fs.removeSync(dest);
        fs.copySync(src, dest);
    };
};
const copyFiles = (tempFolder, cfgJson) => {
    // copy all files as is from downloaded to here (overwrite)
    for(let file of cfgJson.update.files) {
        src = tempFolder + '/' + file.src + file.name;
        dest = (file.dest || file.src) + file.name; // when src and dest are actually same at different root path
        console.log('updating file: ' + src + ' --> ' + dest);
        fs.createReadStream(src).pipe(fs.createWriteStream(dest));
    };
};
const updatePackage = (tempFolder, cfgJson) => {
    let repoPackageJson = require(tempFolder + '/package.json'), 
        added = 0;
    if (cfgJson.package.devDependencies) {
        for(let dep in repoPackageJson.devDependencies) {
            if (repoPackageJson.devDependencies.hasOwnProperty(dep)) {
                if (typeof packageJson.devDependencies[dep] === 'undefined') {
                    packageJson.devDependencies[dep] = repoPackageJson.devDependencies[dep];
                    added++;
                }
            }
        }
    }
    if (cfgJson.package.dependencies) {
        for(let dep in repoPackageJson.dependencies) {
            if (repoPackageJson.dependencies.hasOwnProperty(dep)) {
                if (typeof packageJson.dependencies[dep] === 'undefined') {
                    packageJson.dependencies[dep] = repoPackageJson.dependencies[dep];
                    added++;
                }
            }
        }
    }
    packageJson[cfgJson.package.versionKey] = repoPackageJson.version; // update version
    fs.writeJSONSync('./package.json', packageJson, {
        spaces: '\t'
    });
    if (added > 0) {
        console.log(added + ' packages added in package.json. Run yarn install to add these new dependencies.');
    } else {
        console.log('No new dependency is found.');
    }
};
const doUpdate = (cfgJson, onDone) => {
    let tempFolder = 'upd/.download',
        tempFolderForRequire = './.download',
        downloader = null;

    // create temp folder
    fs.ensureDirSync(tempFolder);

    // when done
    const whenDone = () => {
        // delete temp folder
        fs.removeSync(tempFolder); 

        // done
        onDone();
    };

    switch(cfgJson.downloader) {
        case 'github':
            downloader = GitHubDownloader;
            downloader(cfgJson.repo + '#' + cfgJson.branch, tempFolder, (e) => {
                if (e) {
                    console.log('Update failed.');
                    console.log(e);
                } else {
                    copyFolders(tempFolder, cfgJson);
                    copyFiles(tempFolder, cfgJson);
                    updatePackage(tempFolderForRequire, cfgJson);
                }
                whenDone();
            });
            break;
        case 'gitlab':
            downloader = new GitLabDownloader(cfgJson.url, cfgJson.token);
            downloader.download({
                remote: cfgJson.repo,
                dest: tempFolder,
                ref: cfgJson.branch
            }).then((success) => {
                if (success) {
                    copyFolders(tempFolder, cfgJson);
                    copyFiles(tempFolder, cfgJson);
                    updatePackage(tempFolderForRequire, cfgJson);
                } else {
                    console.log('Update failed.');
                    console.log(e);
                }
                whenDone();
            }).catch((e) => {
                console.log('Update failed.');
                console.log(e);
                whenDone();
            })
            break;
    }
};
const updater = function(cfg, onDone) {
    let cfgJson = require(cfg),
        goForUpdate = false;
    if (cfgJson.condition.allowedIn) {
        if (packageJson.name === cfgJson.condition.allowedIn) {
            goForUpdate = true;
        } else {
            console.log(`This update can be executed only in ${cfgJson.condition.allowedIn} development environment. Aborted!`);
        }
    } else if (cfgJson.condition.notAllowedIn) {
        if (packageJson.name === cfgJson.condition.notAllowedIn) {
            console.log(`This update cannot be executed in ${cfgJson.condition.allowedIn} development environment. Aborted!`);
        } else {
            goForUpdate = true;
        }
    }
    if (goForUpdate) {
        console.log(`This will update ${cfgJson.title} files from ${cfgJson.url}${cfgJson.repo}#${cfgJson.branch}.`);
        console.log('Are you sure you want to run this update? Type "yes" to continue.');
        prompt.start();
        prompt.get(['response'], function (err, result) {
            if (result.response === 'yes') {
                console.log('Updating...');
                doUpdate(cfgJson, onDone);
            } else {
                console.log('Aborted!');
            }
        });
    }
};

// run what is asked
let args = process.argv.slice(2);
updater(args[0], () => {
    // done
    console.log('Update success.');
});    
