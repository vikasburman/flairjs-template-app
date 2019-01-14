const fsx = require('fs-extra');
const gulpConfig = require('../config/.gulp.json');
const packageJSON = JSON.parse(fsx.readFileSync('./package.json', 'utf8'));
const req = require('request');

// do
const doTask = (done) => {
    const processNext = (items) => {
        if (items.length !== 0) {
            let item = items.shift();
            req(item.src, (err, res, body) => {
                if (err) {
                    throw `Failed to fetch dependency: ${item.src}. \n\n ${err}`;
                }
                fsx.ensureFileSync(item.dest);
                fsx.writeFileSync(item.dest, body, 'utf8');
                processNext(items);
            });
        } else {
            // done
            done();
        }
    }

    processNext(gulpConfig.deps.slice());
};
exports.deps = function(cb) {
    doTask(cb);
};