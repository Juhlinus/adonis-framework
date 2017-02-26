import { NE } from 'node-exceptions';

export class RuntimeException extends NE.RuntimeException {

  /**
   * default error code to be used for raising
   * exceptions
   *
   * @return {Number}
   */
  static get defaultErrorCode (): number {
    return 500
  }

  /**
   * this exception is thrown when a route action is referenced
   * inside a view but not registered within the routes file.
   *
   * @param  {String} action
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static missingRouteAction (action: string, code?: number): Object {
    return new NE.RuntimeException(`The action ${action} has not been found`, code || this.defaultErrorCode, 'E_MISSING_ROUTE_ACTION')
  }

  /**
   * this exception is thrown when a route is referenced inside
   * a view but not registered within the routes file.
   *
   * @param  {String} route
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static missingRoute (route: string, code?: number): Object {
    return new NE.RuntimeException(`The route ${route} has not been found`, code || this.defaultErrorCode, 'E_MISSING_ROUTE')
  }

  /**
   * this exceptions is raised when mac is invalid when
   * trying to encrypt data
   *
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidEncryptionMac (code?: number): Object {
    return new NE.RuntimeException('The MAC is invalid', code || this.defaultErrorCode, 'E_INVALID_ENCRYPTION_MAC')
  }

  /**
   * this exception is raised when encryption payload is not valid
   *
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidEncryptionPayload (code?: number): Object {
    return new NE.RuntimeException('The payload is invalid', code || this.defaultErrorCode, 'E_INVALID_ENCRYPTION_PAYLOAD')
  }

  /**
   * this exception is raised when expected value is
   * not a valid json object.
   *
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static malformedJSON (code?: number): Object {
    return new NE.RuntimeException('The payload is not a json object', code || this.defaultErrorCode, 'E_MALFORMED_JSON')
  }

  /**
   * this exception is raised when an operation is attempted
   * on a file that has been deleted
   *
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static fileDeleted (code?: number): Object {
    return new NE.RuntimeException('The file has already been deleted', code || this.defaultErrorCode, 'E_FILE_DELETED')
  }

  /**
   * this exception is raised when encryption class is not
   * able to decrypt a given piece of data
   *
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static decryptFailed (code?: number): Object {
    return new NE.RuntimeException('Could not decrypt the data', code || this.defaultErrorCode, 'E_ENCRYPTION_DECRYPT_FAILED')
  }

  /**
   * this exception is raised when the encryption cipher is
   * not supported or app key length is not in-sync with
   * given cipher
   *
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidEncryptionCipher (code?: number): Object {
    return new NE.RuntimeException('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths', code || this.defaultErrorCode, 'E_INVALID_ENCRPYTION_CIPHER')
  }

  /**
   * this exception is raised when app key is missing
   * inside config/app.js file.
   *
   * @param  {String} message
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static missingAppKey (message: string, code?: number): Object {
    return new NE.RuntimeException(message, code || this.defaultErrorCode, 'E_MISSING_APPKEY')
  }

  /**
   * this exception is raised when an uknown
   * session driver is used
   *
   * @param  {String} driver
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidSessionDriver (driver: string, code?: number): Object {
    return new NE.RuntimeException(`Unable to locate ${driver} session driver`, code || this.defaultErrorCode, 'E_INVALID_SESSION_DRIVER')
  }

  /**
   * this exception is raised when a named middleware is used
   * but not registered
   *
   * @param  {String} name
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static missingNamedMiddleware (name: string, code?: number): Object) {
    return new NE.RuntimeException(`${name} is not registered as a named middleware`, code || this.defaultErrorCode, 'E_MISSING_NAMED_MIDDLEWARE')
  }

}

export class InvalidArgumentException extends NE.InvalidArgumentException {

  /**
   * default error code to be used for raising
   * exceptions
   *
   * @return {Number}
   */
  static get defaultErrorCode (): number {
    return 500
  }

  /**
   * this exception is raised when a method parameter is
   * missing but expected to exist.
   *
   * @param  {String} message
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static missingParameter (message: string, code?: number): Object {
    return new NE.InvalidArgumentException(message, code || this.defaultErrorCode, 'E_MISSING_PARAMETER')
  }

  /**
   * this exception is raised when a method parameter value
   * is invalid.
   *
   * @param  {String} message
   * @param  {Number} [code=500]
   *
   * @return {Object}
   */
  static invalidParameter (message: string, code?: number): Object {
    return new NE.InvalidArgumentException(message, code || this.defaultErrorCode, 'E_INVALID_PARAMETER')
  }

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
  static missingEvent (event: string, name: string, code?: number): Object {
    return new NE.InvalidArgumentException(`Cannot find an event with ${name} name for ${event} event`, code || this.defaultErrorCode, 'E_MISSING_NAMED_EVENT')
  }

}

export class HttpException extends NE.HttpException {}