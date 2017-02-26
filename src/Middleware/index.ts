/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import * as  _ from 'lodash'
import { Ioc } from 'adonis-fold'
import { RuntimeException, InvalidArgumentException, HttpException } from '../Exceptions'

/**
 * Http middleware layer to register and resolve middleware
 * for a given HTTP request.
 * @module Middleware
 */
export class Middleware {
  private globalMiddleware: Array<any>
  private namedMiddleware: Object

  /**
   * clears off all global and named middleware
   *
   * @method new
   *
   * @public
   */
  new(): void {
    this.globalMiddleware = []
    this.namedMiddleware = {}
  }

  /**
   * registers a new global or named middleware. If second
   * parameter is empty, middleware will be considered
   * global.
   *
   * @method register
   *
   * @param  {String} [key] - unqiue key for named middleware
   * @param  {String} namespace - Reference to the binding of Ioc container
   *
   * @example
   * Middleware.register('App/Http/Middleware/Auth')
   * Middleware.register('app', 'App/Http/Middleware/Auth')
   *
   * @public
   */
  register(key: string, namespace: string): void {
    if (!namespace) {
      this.globalMiddleware.push(key)
      return
    }
    this.namedMiddleware[key] = namespace
  }

  /**
   * concats a array of middleware inside global list.
   *
   * @method global
   *
   * @param  {Array} arrayOfMiddleware
   *
   * @example
   * Middleware.global(['App/Http/Middleware/Auth', '...'])
   *
   * @public
   */
  global(arrayOfMiddleware: Array<any>): void {
    this.globalMiddleware = this.globalMiddleware.concat(_.uniq(arrayOfMiddleware))
  }

  /**
   * adds an object of middleware to named list.
   *
   * @method named
   *
   * @param  {Object} namedMiddleware
   *
   * @example
   * Middleware.named({'auth': 'App/Http/Middleware/Auth'}, {...})
   *
   * @public
   */
  named(namedMiddleware: Object): void {
    _.each(namedMiddleware, (namespace, key) => this.register(key, namespace))
  }

  /**
   * returns list of global middleware
   *
   * @method getGlobal
   *
   * @return {Array}
   *
   * @public
   */
  getGlobal(): Array<any> {
    return this.globalMiddleware
  }

  /**
   * returns list of named middleware
   *
   * @method getNamed
   *
   * @return {Object}
   *
   * @public
   */
  getNamed(): Object {
    return this.namedMiddleware
  }

  /**
   * fetch params defined next to named middleware while
   * consuming them.
   *
   * @method fetchParams
   *
   * @param  {String|Undefined}    params
   * @return {Array}
   *
   * @public
   */
  fetchParams(params: String|undefined): Array<string> {
    return params ? params.split(',') : []
  }

  /**
   * returning an object of named middleware by
   * parsing them.
   *
   * @method formatNamedMiddleware
   *
   * @param  {Array}              keys
   * @return {Object}
   *
   * @example
   * Middleware.formatNamedMiddleware(['auth:basic,jwt'])
   * returns
   * {'Adonis/Middleware/Auth': ['basic', 'jwt']}
   *
   * @throws {RunTimeException} If named middleware for a given
   *                            key is not registered.
   * @public
   */
  formatNamedMiddleware(keys: Array<string>): Object {
    return _.reduce(keys, (structured, key) => {
      const tokens = key.split(':')
      const middlewareNamespace = this.namedMiddleware[tokens[0]]
      if (!middlewareNamespace) {
        throw RuntimeException.missingNamedMiddleware(tokens[0])
      }
      structured[middlewareNamespace] = this.fetchParams(tokens[1])
      return structured
    }, {})
  }

  /**
   * resolves an array of middleware namespaces from
   * ioc container
   *
   * @method resolve
   *
   * @param  {Object} namedMiddlewareHash
   * @param  {Boolean} [includeGlobal=false]
   *
   * @return {Array}
   *
   * @example
   * Middleware.resolve({}, true) // all global
   * Middleware.resolve(Middleware.formatNamedMiddleware(['auth:basic', 'acl:user']))
   *
   * @public
   */
  resolve(namedMiddlewareHash: Object, includeGlobal: Boolean): Array<any> {
    const finalSet = includeGlobal ? this.getGlobal().concat(_.keys(namedMiddlewareHash)) : _.keys(namedMiddlewareHash)
    return _.map(finalSet, (item) => {
      const func = Ioc.makeFunc(`${item}.handle`)
      func.parameters = namedMiddlewareHash[item] || []
      return func
    })
  }

  /**
   * composes middleware and calls them in sequence something similar
   * to koa-compose.
   *
   * @method compose
   *
   * @param  {Array} Middleware - Array of middleware resolved from Ioc container
   * @param  {Object} request - Http request object
   * @param  {Object} response - Http response object
   *
   * @public
   */
  compose(middlewareList: Array<any>, request: Object, response: Object) {
    function* noop() { }
    return function* (next) {
      next = next || noop()
      _(middlewareList)
        .map((middleware) => {
          return typeof (middleware) === 'function' ? this._composeFunction(middleware) : this._composeObject(middleware)
        })
        .forEachRight((middleware) => {
          const values = [request, response, next].concat(middleware.parameters)
          next = middleware.method.apply(middleware.instance, values)
        })
      return yield* next
    }
  }

  /**
   * composes a closure to an object for consistent behaviour
   *
   * @method  _composeFunction
   *
   * @param   {Function}         middleware
   *
   * @return  {Object}
   *
   * @private
   */
  _composeFunction(middleware: Function): Object {
    return { instance: null, method: middleware, parameters: [] }
  }

  /**
   * composes a consistent object from the actual
   * middleware object
   *
   * @method  _composeObject
   *
   * @param   {Object}       middleware
   *
   * @return  {Object}
   *
   * @private
   */
  _composeObject(middleware: any): Object {
    const instance = middleware.instance || null
    const method = instance ? instance[middleware.method] : middleware.method
    return { instance, method, parameters: middleware.parameters }
  }
}
