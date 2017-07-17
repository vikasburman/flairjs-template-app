const fs = require('fs');
const path = require('path');
const buildSettings = require('./.build.json');

// get folders under given root
exports.getFolders = (root, excludeRoot) => {
    const _getFolders = () => {
        return fs.readdirSync(root)
            .filter((file) => {
                return fs.statSync(path.join(root, file)).isDirectory();
        });
    }
    if (excludeRoot) {
        return _getFolders();
    } 
    return ['/'].concat(_getFolders());
};
// get source excluding configured ones
exports.getSource = (root, folder, ...patterns) => {
    let src = [];
    for(let incGlob of patterns) {
        src.push(path.join(root, folder, incGlob));
    }
    if (buildSettings.globs.exclude) {
        for(let exGlob of buildSettings.globs.exclude) {
            src.push('!' + path.join(root, folder, exGlob));
        }
    }
    return src;
};
// error handler
exports.errorHandler = (name) => {
    return function (err) {
        console.error('Error in task: ' + name);
        console.error('Error: ' + err.toString());
    };
};