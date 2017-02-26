"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_exceptions_1 = require("node-exceptions");
var RuntimeException = (function (_super) {
    __extends(RuntimeException, _super);
    function RuntimeException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(RuntimeException, "defaultErrorCode", {
        /**
         * default error code to be used for raising
         * exceptions
         *
         * @return {Number}
         */
        get: function () {
            return 500;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * this exception is thrown when a route action is referenced
     * inside a view but not registered within the routes file.
     *
     * @param  {String} action
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.missingRouteAction = function (action, code) {
        return new node_exceptions_1.NE.RuntimeException("The action " + action + " has not been found", code || this.defaultErrorCode, 'E_MISSING_ROUTE_ACTION');
    };
    /**
     * this exception is thrown when a route is referenced inside
     * a view but not registered within the routes file.
     *
     * @param  {String} route
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.missingRoute = function (route, code) {
        return new node_exceptions_1.NE.RuntimeException("The route " + route + " has not been found", code || this.defaultErrorCode, 'E_MISSING_ROUTE');
    };
    /**
     * this exceptions is raised when mac is invalid when
     * trying to encrypt data
     *
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.invalidEncryptionMac = function (code) {
        return new node_exceptions_1.NE.RuntimeException('The MAC is invalid', code || this.defaultErrorCode, 'E_INVALID_ENCRYPTION_MAC');
    };
    /**
     * this exception is raised when encryption payload is not valid
     *
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.invalidEncryptionPayload = function (code) {
        return new node_exceptions_1.NE.RuntimeException('The payload is invalid', code || this.defaultErrorCode, 'E_INVALID_ENCRYPTION_PAYLOAD');
    };
    /**
     * this exception is raised when expected value is
     * not a valid json object.
     *
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.malformedJSON = function (code) {
        return new node_exceptions_1.NE.RuntimeException('The payload is not a json object', code || this.defaultErrorCode, 'E_MALFORMED_JSON');
    };
    /**
     * this exception is raised when an operation is attempted
     * on a file that has been deleted
     *
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.fileDeleted = function (code) {
        return new node_exceptions_1.NE.RuntimeException('The file has already been deleted', code || this.defaultErrorCode, 'E_FILE_DELETED');
    };
    /**
     * this exception is raised when encryption class is not
     * able to decrypt a given piece of data
     *
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.decryptFailed = function (code) {
        return new node_exceptions_1.NE.RuntimeException('Could not decrypt the data', code || this.defaultErrorCode, 'E_ENCRYPTION_DECRYPT_FAILED');
    };
    /**
     * this exception is raised when the encryption cipher is
     * not supported or app key length is not in-sync with
     * given cipher
     *
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.invalidEncryptionCipher = function (code) {
        return new node_exceptions_1.NE.RuntimeException('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths', code || this.defaultErrorCode, 'E_INVALID_ENCRPYTION_CIPHER');
    };
    /**
     * this exception is raised when app key is missing
     * inside config/app.js file.
     *
     * @param  {String} message
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.missingAppKey = function (message, code) {
        return new node_exceptions_1.NE.RuntimeException(message, code || this.defaultErrorCode, 'E_MISSING_APPKEY');
    };
    /**
     * this exception is raised when an uknown
     * session driver is used
     *
     * @param  {String} driver
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.invalidSessionDriver = function (driver, code) {
        return new node_exceptions_1.NE.RuntimeException("Unable to locate " + driver + " session driver", code || this.defaultErrorCode, 'E_INVALID_SESSION_DRIVER');
    };
    /**
     * this exception is raised when a named middleware is used
     * but not registered
     *
     * @param  {String} name
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    RuntimeException.missingNamedMiddleware = function (name, code) {
        return new node_exceptions_1.NE.RuntimeException(name + " is not registered as a named middleware", code || this.defaultErrorCode, 'E_MISSING_NAMED_MIDDLEWARE');
    };
    return RuntimeException;
}(node_exceptions_1.NE.RuntimeException));
exports.RuntimeException = RuntimeException;
var InvalidArgumentException = (function (_super) {
    __extends(InvalidArgumentException, _super);
    function InvalidArgumentException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(InvalidArgumentException, "defaultErrorCode", {
        /**
         * default error code to be used for raising
         * exceptions
         *
         * @return {Number}
         */
        get: function () {
            return 500;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * this exception is raised when a method parameter is
     * missing but expected to exist.
     *
     * @param  {String} message
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    InvalidArgumentException.missingParameter = function (message, code) {
        return new node_exceptions_1.NE.InvalidArgumentException(message, code || this.defaultErrorCode, 'E_MISSING_PARAMETER');
    };
    /**
     * this exception is raised when a method parameter value
     * is invalid.
     *
     * @param  {String} message
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    InvalidArgumentException.invalidParameter = function (message, code) {
        return new node_exceptions_1.NE.InvalidArgumentException(message, code || this.defaultErrorCode, 'E_INVALID_PARAMETER');
    };
    /**
     * this exception is raised when unable to find
     * an event with a given name
     *
     * @param  {String} event
     * @param  {String} name
     * @param  {Number} [code=500]
     *
     * @return {Object}
     */
    InvalidArgumentException.missingEvent = function (event, name, code) {
        return new node_exceptions_1.NE.InvalidArgumentException("Cannot find an event with " + name + " name for " + event + " event", code || this.defaultErrorCode, 'E_MISSING_NAMED_EVENT');
    };
    return InvalidArgumentException;
}(node_exceptions_1.NE.InvalidArgumentException));
exports.InvalidArgumentException = InvalidArgumentException;
var HttpException = (function (_super) {
    __extends(HttpException, _super);
    function HttpException() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return HttpException;
}(node_exceptions_1.NE.HttpException));
exports.HttpException = HttpException;
