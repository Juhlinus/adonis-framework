"use strict";
/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
var path = require("path");
var _ = require("lodash");
var process = require("process");
var cat_log_1 = require("cat-log");
var node_exceptions_1 = require("node-exceptions");
var rootPath = ''; // application root path
var autoloadNameSpace = ''; // autoloading namespace | required for backword compatibility
/**
 * path to base directories with relative
 * paths from the project root.
 *
 * @type {Object}
 */
var originalProjectDirectories = {
    public: 'public',
    storage: 'storage',
    database: 'database',
    resources: 'resources',
    config: 'config',
    app: 'app'
};
/**
 * cloning over original app directories so that orignal
 * reset method should be able to restore it.
 *
 * @type {Object}
 */
var projectDirectories = _.clone(originalProjectDirectories);
/**
 * Manage commonly required methods to be used anywhere inside
 * the application
 * @module Helpers
 */
var Helpers = (function () {
    function Helpers() {
        /**
         * loads package.json file from application and set required paths
         * and namespace based on same.
         *
         * @method load
         *
         * @param  {String} packagePath
         * @param  {Object} Ioc
         *
         * @throws {DomainException} If autoload is not defined in package.json file
         *
         * @public
         */
        this.load = function (packagePath, Ioc) {
            this.reset(); // reset itself before start
            this.log.verbose('reading autoload settings from %s', packagePath);
            rootPath = path.dirname(packagePath);
            var packageFile = require(packagePath);
            if (!packageFile.autoload) {
                throw new node_exceptions_1.NE.DomainException('autoload must be enable inside package.json file');
            }
            var autoloadSettings = Object.keys(packageFile.autoload);
            if (!autoloadSettings.length) {
                throw new node_exceptions_1.NE.DomainException('autoload must be enable inside package.json file');
            }
            autoloadNameSpace = autoloadSettings[0];
            this.setProjectDirectory('app', packageFile.autoload[autoloadNameSpace]);
            if (Ioc && Ioc.autoload) {
                Ioc.autoload(autoloadNameSpace, path.join(rootPath, projectDirectories.app));
            }
        };
        /**
         * the load method to be shipped with 3.1
         *
         * @param  {String} appRoot
         *
         * @public
         */
        this.loadInFuture = function (appRoot) {
            rootPath = appRoot;
        };
        /**
         * reset helpers state back to original
         *
         * @public
         */
        this.reset = function () {
            projectDirectories = _.clone(originalProjectDirectories);
            rootPath = null;
            autoloadNameSpace = null;
        };
        /**
         * returns the current mapping of directories
         *
         * @return {Object}
         *
         * @public
         */
        this.getProjectDirectories = function () {
            return projectDirectories;
        };
        /**
         * overrides the current mapping of directories
         *
         * @param  {Object} directories
         *
         * @public
         */
        this.setProjectDirectories = function (directories) {
            projectDirectories = directories;
        };
        /**
         * overrides a give mapping of directories.
         *
         * @param  {String} name
         * @param  {String} toPath
         *
         * @public
         */
        this.setProjectDirectory = function (name, toPath) {
            projectDirectories[name] = toPath;
        };
        /**
         * Returns absolute path to application root
         *
         * @method basePath
         *
         * @return {String}
         */
        this.basePath = function () {
            return rootPath;
        };
        /**
         * Returns absolute path to application folder which is
         * defined under a given namespace.
         *
         * @method appPath
         *
         * @return {String}
         */
        this.appPath = function () {
            var toDir = projectDirectories.app;
            return this._makePath(rootPath, toDir);
        };
        /**
         * Returns absolute path to application public folder or path to a
         * given file inside public folder.
         *
         * @method publicPath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         */
        this.publicPath = function (toFile) {
            var toDir = projectDirectories.public;
            return this._makePath(rootPath, toDir, toFile);
        };
        /**
         * Returns application namespace , under which
         * app directory is registered.
         *
         * @method appNameSpace
         *
         * @return {String}
         */
        this.appNameSpace = function () {
            return autoloadNameSpace;
        };
        /**
         * makes complete namespace for a given path and base
         * namespace
         *
         * @method makeNameSpace
         *
         * @param  {String}      baseNameSpace
         * @param  {String}      toPath
         * @return {String}
         *
         * @public
         */
        this.makeNameSpace = function (baseNameSpace, toPath) {
            var appNameSpace = this.appNameSpace();
            if (toPath.startsWith(appNameSpace + "/")) {
                return toPath;
            }
            return path.normalize(appNameSpace + "/" + baseNameSpace + "/" + toPath);
        };
        /**
         * returns absolute path to config directory or a file inside
         * config directory
         *
         * @method configPath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         */
        this.configPath = function (toFile) {
            var toDir = projectDirectories.config;
            return this._makePath(rootPath, toDir, toFile);
        };
        /**
         * returns absolute path to storage path of application or an
         * file inside the storage path.
         *
         * @method storagePath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         *
         * @public
         */
        this.storagePath = function (toFile) {
            var toDir = projectDirectories.storage;
            return this._makePath(rootPath, toDir, toFile);
        };
        /**
         * returns absolute path to resources directory or a file inside
         * resources directory
         *
         * @method resourcesPath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         *
         * @public
         */
        this.resourcesPath = function (toFile) {
            var toDir = projectDirectories.resources;
            return this._makePath(rootPath, toDir, toFile);
        };
        /**
         * returns absolute path to database/migrations directory.
         *
         * @method migrationsPath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         *
         * @public
         */
        this.migrationsPath = function (toFile) {
            var toDir = toFile ? "./migrations/" + toFile : './migrations';
            return this.databasePath(toDir);
        };
        /**
         * returns absolute path to database/seeds directory.
         *
         * @method seedsPath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         *
         * @public
         */
        this.seedsPath = function (toFile) {
            var toDir = toFile ? "./seeds/" + toFile : './seeds';
            return this.databasePath(toDir);
        };
        /**
         * returns absolute path to database/factories directory.
         *
         * @method factoriesPath
         *
         * @param  {String}   [toFile] - filename to return path for
         * @return {String}
         *
         * @public
         */
        this.factoriesPath = function (toFile) {
            var toDir = toFile ? "./factories/" + toFile : './factories';
            return this.databasePath(toDir);
        };
        /**
         * returns path to the database directory.
         *
         * @method databasePath
         *
         * @param  {String}     toFile
         * @return {String}
         *
         * @public
         */
        this.databasePath = function (toFile) {
            var toDir = projectDirectories.database;
            return this._makePath(rootPath, toDir, toFile);
        };
        /**
         * returns whether the process belongs to ace command
         * or not.
         *
         * @method isAceCommand
         *
         * @return {Boolean}
         *
         * @public
         */
        this.isAceCommand = function () {
            var processFile = process.mainModule.filename;
            return processFile.endsWith('ace');
        };
        /**
         * returns absolute path to views directory
         *
         * @method viewsPath
         *
         * @return {String}
         *
         * @public
         */
        this.viewsPath = function () {
            return this.resourcesPath('views');
        };
        /**
         * makes path by joining two endpoints
         *
         * @method _makePath
         *
         * @param  {String}  base
         * @param  {String}  toDir
         * @param  {String}  toFile
         * @return {String}
         *
         * @private
         */
        this._makePath = function (base, toDir, toFile) {
            toDir = path.isAbsolute(toDir) ? toDir : path.join(base, toDir);
            return toFile ? path.join(toDir, toFile) : toDir;
        };
        this.log = new cat_log_1.CatLog('adonis:framework');
    }
    return Helpers;
}());
exports.Helpers = Helpers;
