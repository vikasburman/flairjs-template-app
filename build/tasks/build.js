const gulp = require('gulp');
const gulpConfig = require('../config/.gulp.json');
const uglifyjs = require('uglify-js-harmony');
const uglifyConfig = require('../config/.uglify.json');
const fs = require('fs');
const fsx = require('fs-extra');
const rrd = require('recursive-readdir-sync');
const path = require('path');
const packageJSON = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const errorHandler = require('../utils.js').errorHandler;
const getFolders = require('../utils.js').getFolders;
const delAll = require('../utils.js').delAll;
const copyDir = require('copy-dir');
const eslint = new require("eslint").CLIEngine(require('../config/.eslint.json'));
const eslintFormatter = eslint.getFormatter();

// do
const doTask = (done) => {
    // build is doing following:
    //  > copy start.js from gears to server and client, if not already present
    //  > 
    //  > 
    //  > 
    //  > 
    //  > if start.js was copied as part of build to server and client folder, so delete it
    //  for each root folder under source/app/<folder>/* and source/web/<folder>/* folders, it will generate an assembly (bundled JS file)
    //  following rules are applied:
    //  1. skip folders and files that starts with '_'
    //  2. pick folders and files in sorted order
    //  3. sort order is defined by name, so prefixing a number in folder or file name is desired to have required order
    //  4. only JS files are bundled, all other files are left as is, and each JS file will be wrapped in an auto-executable function: (function() { .. file .. }();)
    //  5. files under special folder named 'assets' will be copied to dist folder under the name of main folder itself
    //  6. files under special folder names 'deps' will be bundled first
    //  7. pick index.js file as first file (if exists) after content of 'deps' folder and process defined string injections
    //  8. bundled file will be minified at the end and finally copied to dist folder under same hierarch of app/<folder>/* and web/<folder>/*
    //  9. For each bundled file under app and www folders respectively, one ADO (Assembly Definition Object) will be generated in <name>.app.json and <name>.www.jsonfile, which can be passed to flair.Assembly.register()
    
    // get ordered list of files
    const getOrderedFiles = (fld, onlyTypes) => {
        let files = [],
            ext = '';
        if (fsx.pathExistsSync(fld)) {
            let _files = rrd(fld);
            _files.sort(); // so order can be arranged
            for(let _file of _files) {
                if (onlyTypes) {
                    ext = path.extname(_file).toLowerCase());
                    if (onlyTypes.indexOf(ext) === -1) {
                        continue;
                    }
                }
                if (!item.startsWith('_') && !item.startsWith('./')) { // ignore which starts with '_' (and for some strange cases starts with ./)
                    files.push(fld + '/' + _file);
                }   
            }
        }
        return files;
    };
    
    // append text to file
    const appendToFile = (asm, text) => {
        fsx.writeFileSync(asm, text);
    };

    // append assembly header
    const appendHeader = (asm) => {
        let header = 
        `/**\n`+
        ` * ${packageJSON.title}\n` +
        ` * ${asmName}.js\n` +
        ` * .${root}/${asmFolder}.js\n` +
        ` * ${packageJSON.description}\n` +
        ` * Version ${packageJSON.version}\n` +
        ` * ${packageJSON.copyright}\n` +
        ` * ${packageJSON.license}\n` +
        ` */\n\n`;
        appendToFile(asm, header);
    };

    const appendADO = (ados, asm, asmName) => {
        // each ADO object has:
        //      "name": "", 
        //      "file": "",
        //      "desc": "",
        //      "version": "",
        //      "copyright": "",
        //      "license": "",
        //      "types": ["", "", ...]
        let ADO = {
            name: asmName,
            file: asm,
            desc: packageJSON.desc,
            version: packageJSON.version,
            copyright.packageJSON.copyright,
            license.packageJSON.license,
            types: []
        };
        ados.push(ADO);
        return ADO;
    };

    // append file
    const appendFile = (asm, file) => {
        fsx.writeFileSync(asm, `\n\n<!-- ${file} -->\n\n`, {flag: 'a'});
        fsx.writeFileSync(asm, fsx.readFileSync(file, 'utf8'), {flag: 'a'});
    };

    // append files
    const appendFiles = (asm, fld) => {
        let files = getOrderedFiles(fld);
        for(let file of files) {
            appendFile(asm, file);
        }
    };

    // append resources
    const appendResources = (ado, asm, fld) => {
        // each resource is placed in its own folder where folder name is the qualfied name of the
        // resource itself, so for example, a resource abc.json can be placed in gears.abc folder
        // and it will be accessible as Resource.get('gears.abc').JSON
        // NOTE: if there are more files in each resource folder, only first file will be picked,
        // so place only one file per folder under 'res' folder
        // following types of files can be added as resource:
        //  JS: can be loaded via load.asJS()
        //  CSS: can be loaded via load.asCSS()
        //  HTML: can be loaded via load.asHTML()
        //  JSON: can be loaded via load.asJSON() or read directly as .JSON
        //  Images of type (JPG/JPEG, GIF, PNG): can be loaded via load.asImage()
        //  Files of type (TXT, XML): can be loaded via load.asText()
        //  Rest all files: can be loaded via load.asBase64()
        let folders = getFolders(fld, true),
            resFile = '',
            resData = '',
            files = [],
            file = '',
            ext = '',
            content = '';
        for (let resName of folders) {
            files = fsx.readdirSync(fld + '/' + resName);
            if (files.length > 0) { 
                file = files[0]; // pick first file, ignore 
                ext = path.extname(file).toLowerCase(),
                resFile = fld + '/' + resName + '/' + file;

                // read file
                content = fsx.readFileSync(resFile, 'utf8');
                if (['txt', 'xml', 'js', 'mjs', 'json', 'css', 'html'].indexOf(ext) === -1) { //#endregion// need base 64 encoding
                    content = new Buffer(content).toString('base64');
                }

                // build resource
                let dump = `\n\n //start: ${resFile}\n\nflair.Resource(${resName}, ${resFile}, ${content});\n\n //end: ${resFile}\n\n`;
                
                // add
                appendToFile(asm, dump);

                // register with ado
                ado.types.push(resName);
            }
        }
    };

    // copy assets
    const copyAssets(asmFolder, fld) => {
        if (fsx.pathExistsSync(fld)) {
            // copy files and folders from fld to asmFolder, as is
            copyDir.sync(fld, asmFolder);
        }
    };

    // run lint
    const runLint(jsFile) => {
        let lintReport = eslint.executeOnFiles([jsFile]);
        eslintFormatter(lintReport.results);
        if (lintReport.errorCount > 0) {
            throw `${lintReport.errorCount} Linting errors found.`;
        }
    };

    // minify code
    const minifyFile(jsFile) => {
        let result = uglifyjs.minify(fsx.readFileSync(jsFile, 'utf8'), uglifyConfig.js);
        if (result.error) {
            throw `Error minifying ${jsFile}. \n\n ${result.error}`;
        }
        return result.code;
    };

    // append types
    const appendTypes = (ado, asm, fld) => {
        let folders = getFolders(fld, true),
            typeName = '',
            theFile = '',
            minifiedContent = '';
        for (let folder of folders) {
            files = fsx.readdirSync(fld + '/' + folder);
            for(let file of files) {
                ext = path.extname(file).toLowerCase(),
                theFile = fld + '/' + folder + '/' + file;
                if (ext === 'js' || ext === 'mjs') {
                    typeName = path.basename(file);
                
                    // run lint on this
                    runLint(theFile);

                    // minify content
                    minifiedContent = minifyFile(theFile);

                    // append file
                    appendToFile(asm, minifiedContent);

                    // register in ADO
                    ado.types.push(typeName);                    
                }
            }
        }
    };

    // append initializer
    const appendInit = (asm, fle) => {
        // pick fle, if exists
        if (fs.existsSync(fle)) {
            appendFile(asm, fle);
        }
    };

    // process folder
    const process = (src, dest) => {
        // ados.json for this root
        let adosJSON =  [];

        // get all assemblies under this root
        let folders = getFolders(src, true);

        // process each assembly
        for(let asmName of folders) {
            // assembly file at dest
            // NOTE: name of the folder is the name of the assembly itself
            // and should generally be matched to the namespace being used for types and 
            // resources inside assembly
            let asm = dest + '/' + asmName + '.js';
            fsx.ensureFileSync(asm);
            
            // asm header
            appendHeader(asm);

            // append ado object
            let ado = appendADO(adosJSON, asm, asmName);

            // append dependencies
            // multiple folders can exists under /deps folder, all files will be added
            // as is, to fix order of files adding, use a number prefix
            // files will be first read from all folders and then will be sorted as per
            // name of files (having numbered prefix) before bundling
            appendFiles(asm, dest + '/' + asmName + '/deps');
            
            // append resources
            // resources are placed under 'res' folder in a folder that is named as qualified resname itself
            // supported resource types are TXT, XML, JSON, HTML, CSS, JS/MJS, JPG.JPEG, PNG, GIF
            // any other files will also be added as base64 encoded string
            // order of resources cannot be defined
            appendResources(ado, asm, dest + '/' + asmName + '/res');

            // append types
            // types are placed under 'types' folder in any folder structure, each folder can have one
            // or more than one types -- however each type's file name should match to the qualified name
            // of the type itself
            // order of types cannot be defined
            appendTypes(ado, asm, dest + '/' + asmName + '/types');
            
            // append asm initializer
            appendInit(asm, dest + '/' + asmName + '/index.js');

            // uglify 

            // copy assets to dest
            copyAssets(dest + '/' + asmName, dest + '/' + asmName + '/assets');
        }

        // write ados.json for this root
        fsx.writeFileSync(dest + '/ados.json', JSON.parse(adosJSON));
    };

    // delete all dist files
    delAll('./dist');

    // process each folder
    for(let item of gulpConfig.build) {
        process(item.src, item.dest);
    }

   // done
   done();
};
exports.build = function(cb) {
    doTask(cb);
};