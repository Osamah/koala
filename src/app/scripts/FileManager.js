/**
 * FileManager module
 */

'use strict';

var fs   = require('fs'),
    path = require('path'),
    util = require('./util');

exports.rubyExecPath = process.platform === 'win32' ? path.join(path.dirname(process.execPath), 'ruby', 'bin', 'ruby') : 'ruby';

exports.appRootDir   = process.cwd();
    exports.appDataDir      = path.join(exports.appRootDir, 'app');
        exports.appAssetsDir     = path.join(exports.appDataDir, 'assets');
        exports.appBinDir        = path.join(exports.appDataDir, 'bin');
        exports.appExtensionsDir = path.join(exports.appDataDir, 'extensions');
        exports.appLocalesDir    = path.join(exports.appDataDir, 'locales');
        exports.appScriptsDir    = path.join(exports.appDataDir, 'scripts');
        exports.appSettingsDir   = path.join(exports.appDataDir, 'settings');
        exports.appViewsDir      = path.join(exports.appDataDir, 'views');
    exports.packageJSONFile = path.join(exports.appRootDir, 'package.json');

exports.userDataDir  = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.koala');
    exports.userExtensionsDir = path.join(exports.userDataDir, 'extensions');
    exports.userLocalesDir    = path.join(exports.userDataDir, 'locales');
    exports.errorLogFile      = path.join(exports.userDataDir, 'error.log');
    exports.historyFile       = path.join(exports.userDataDir, 'history.json');
    exports.importsFile       = path.join(exports.userDataDir, 'imports.json');
    exports.projectsFile      = path.join(exports.userDataDir, 'projects.json');
    exports.settingsFile      = path.join(exports.userDataDir, 'settings.json');

/**
 * tmp dir of system
 * @return {String} tmp dir
 */
exports.tmpDir = function () {
    var systemTmpDir =
            process.env.TMPDIR ||
            process.env.TMP ||
            process.env.TEMP ||
            (process.platform === 'win32' ? 'c:\\windows\\temp' : '/tmp');

    return path.join(systemTmpDir, 'koala_temp_' + util.createRdStr());
};

/**
 * get whether the file is for the OS or not.
 * @param  {String}  file The file to test.
 * @return {boolean}      `true` if `file` is for the OS, `false` otherwise.
 */
exports.isOSFile = function (file) {
    // OS X
    if (/^\.(_|DS_Store$)/.test(path.basename(file))) {
        return true;
    }
    // Win
    if (/^thumbs\.db$/i.test(path.basename(file))) {
        return true;
    }
    return false;
};

/**
 * get whether the directory is for the OS or not.
 * @param  {String}  dir The directory to test.
 * @return {boolean}     `true` if `dir` is for the OS, `false` otherwise.
 */
exports.isOSDir = function (dir) {
    // OS X
    if (/^\.(fseventsd|Spotlight-V100|TemporaryItems|Trashes)$/.test(path.basename(dir))) {
        return true;
    }
    return false;
};

/**
 * get all file paths under a specific directory.
 * @param  {String}                       dir            The directory path to look under.
 * @param  {boolean}                      skipOSDirs     Whether to skip OS directories. (default true)
 * @param  {Function(filePath, fileName)} shouldSkipFile A function called for each file to determine whether to skip it or not. (default returns false for all files)
 * @return {Array.<String>}                              Array of all file paths under `dir`.
 */
exports.getAllFiles = function (dir, skipOSDirs, shouldSkipFile) {
    var files = [];

    skipOSDirs = skipOSDirs || true;
    shouldSkipFile = shouldSkipFile || function () {return false; };

    function walk(root) {
        if (!fs.existsSync(root)) {
            return ;
        }
        fs.readdirSync(root).forEach(function (item) {
            var itemPath = path.join(root, item);

            if (fs.statSync(itemPath).isDirectory()) {
                // Skip OS directories
                if (!skipOSDirs || !exports.isOSDir(item)) {
                    try {
                        walk(itemPath);
                    } catch (e) {}
                }
            } else if (!shouldSkipFile(itemPath, item)) {
                files.push(itemPath);
            }
        });
    }

    walk(dir);

    return files;
};

/**
 * get all "package.json" file paths under a specific directory.
 * @param  {String}         dir        The directory path to look under.
 * @param  {boolean}        skipOSDirs Whether to skip OS directories. (default true)
 * @return {Array.<String>}            Array of all "package.json" file paths under `dir`.
 */
exports.getAllPackageJSONFiles = function (dir, skipOSDirs) {
    return exports.getAllFiles(dir, skipOSDirs, function (filePath, fileName) {
        return fileName !== "package.json";
    });
};