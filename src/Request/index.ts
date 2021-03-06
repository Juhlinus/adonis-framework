'use strict'

/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { nodeReq } from 'node-req'
import { nodeCookie } from 'node-cookie'
import { File } from '../File'
import { Config } from '../Config'
import * as pathToRegexp from 'path-to-regexp'
import * as  _  from 'lodash'
import { Util } from '../../lib/util'

let configInstance = null

/**
 * Glued http request object to read values for
 * a given request. Instance of this class
 * is generated automatically on every
 * new request.
 * @class
 */
class Request {
  private request: string
  private response: string
  private _body: Object
  private _files: Array<Object>|Array<string>
  private secret: string
  private cookiesObject: Object
  private parsedCookies: boolean
  private util: Util
  private _params: Object

  constructor (request: string, response: string) {
    this.request = request
    this.response = response
    this._body = {}
    this._files = []

    /**
     * secret to parse and decrypt cookies
     * @type {String}
     */
    this.secret = configInstance.get('app.appKey')

    /**
     * holding references to cookies once they
     * have been parsed. It is required to
     * optimize performance as decrypting
     * is an expensive operation
     * @type {Object}
     */
    this.cookiesObject = {}

    /**
     * flag to find whether cookies have been
     * parsed once or not
     * @type {Boolean}
     */
    this.parsedCookies = false
  }

  /**
   * returns input value for a given key from post
   * and get values.
   *
   * @param  {String} key - Key to return value for
   * @param  {Mixed} defaultValue - default value to return when actual
   *                                 value is empty
   * @return {Mixed}
   *
   * @example
   * request.input('name')
   * request.input('profile.name')
   *
   * @public
   */
  input (key: string, defaultValue: any): any {
    defaultValue = this.util.existy(defaultValue) ? defaultValue : null
    const input = this.all()
    const value = _.get(input, key)
    return this.util.existy(value) ? value : defaultValue
  }

  /**
   * returns merged values from get and post methods.
   *
   * @return {Object}
   *
   * @public
   */
  all (): Object {
    return _.merge(this.get(), this.post())
  }

  /**
   * returns all input values except defined keys
   *
   * @param {Mixed} keys an array of keys or multiple keys to omit values for
   * @return {Object}
   *
   * @example
   * request.except('password', 'credit_card')
   * request.except(['password', 'credit_card'])
   *
   * @public
   */
  except (any?: any): Object {
    const args = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)
    return _.omit(this.all(), args)
  }

  /**
   * returns all input values for defined keys only
   *
   * @param {Mixed} keys an array of keys or multiple keys to pick values for
   * @return {Object}
   *
   * @example
   * request.only('name', 'email')
   * request.only(['name', 'name'])
   *
   * @public
   */
  only (any?: any): Object {
    const args = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)
    return _.pick(this.all(), args)
  }

  /**
   * returns a group of objects with defined keys and values
   * corresponding to them. It is helpful when accepting
   * an array of values via form submission.
   *
   * @param {Mixed} keys an array of keys or multiple keys to pick values for
   * @return {Array}
   *
   * @example
   * request.collect('name', 'email')
   * request.collect(['name', 'email'])
   *
   * @public
   */
  collect (): Array<Object> {
    const args = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)
    const selectedValues = this.only(args)

    /**
     * need to make sure the values array is in balance to the expected
     * array. Otherwise map method will pickup values for wrong keys.
     */
    // Don't know if toString() will work
    if (_.size(args) > _.size(selectedValues.toString())) {
      args.forEach((key) => { selectedValues[key] = selectedValues[key] || [] })
    }

    const keys = _.keys(selectedValues)
    const values = _.zip.apply(_, _.values(selectedValues))
    return _.map(values, (item, index) => {
      const group = {}
      _.each(args, (k, i) => { group[keys[i]] = item[i] || null })
      return group
    })
  }

  /**
   * returns query parameters from request querystring
   *
   * @return {Object}
   *
   * @public
   */
  get (): Object {
    return nodeReq.get(this.request)
  }

  /**
   * returns post body from request, BodyParser
   * middleware needs to be enabled for this to work
   *
   * @return {Object}
   *
   * @public
   */
  post (): Object {
    return this._body || {}
  }

  /**
   * returns header value for a given key
   *
   * @param  {String} key
   * @param  {Mixed} defaultValue - default value to return when actual
   *                                 value is undefined or null
   * @return {Mixed}
   *
   * @example
   * request.header('Authorization')
   *
   * @public
   */
  header (key: string, defaultValue: any) {
    defaultValue = this.util.existy(defaultValue) ? defaultValue : null
    const headerValue = nodeReq.header(this.request, key)
    return this.util.existy(headerValue) ? headerValue : defaultValue
  }

  /**
   * returns all request headers from a given request
   *
   * @return {Object}
   *
   * @public
   */
  headers (): Object {
    return nodeReq.headers(this.request)
  }

  /**
   * tells whether request is fresh or not by
   * checking Etag and expires header
   *
   * @return {Boolean}
   *
   * @public
   */
  fresh (): boolean {
    return nodeReq.fresh(this.request, this.response)
  }

  /**
   * opposite of fresh
   *
   * @see fresh
   *
   * @return {Boolean}
   *
   * @public
   */
  stale (): boolean {
    return nodeReq.stale(this.request, this.response)
  }

  /**
   * returns most trusted ip address for a given request. Proxy
   * headers are trusted only when app.http.trustProxy is
   * enabled inside config file.
   *
   * @uses app.http.subdomainOffset
   *
   * @return {String}
   *
   * @public
   */
  ip (): string {
    return nodeReq.ip(this.request, configInstance.get('app.http.trustProxy'))
  }

  /**
   * returns an array of ip addresses sorted from most to
   * least trusted. Proxy headers are trusted only when
   * app.http.trustProxy is enabled inside config file.
   *
   * @uses app.http.subdomainOffset
   *
   * @return {Array}
   *
   * @public
   */
  ips (): Array<string> {
    return nodeReq.ips(this.request, configInstance.get('app.http.trustProxy'))
  }

  /**
   * tells whether request is on https or not
   *
   * @return {Boolean}
   *
   * @public
   */
  secure (): boolean {
    return nodeReq.secure(this.request)
  }

  /**
   * returns an array of subdomains from url. Proxy headers
   * are trusted only when app.http.trustProxy is enabled
   * inside config file.
   *
   * @uses app.http.subdomainOffset
   * @uses app.http.trustProxy
   *
   * @return {Array}
   *
   * @public
   */
  subdomains (): Array<string> {
    return nodeReq.subdomains(this.request, configInstance.get('app.http.trustProxy'), configInstance.get('app.http.subdomainOffset'))
  }

  /**
   * tells whether request is an ajax request or not
   *
   * @return {Boolean}
   *
   * @public
   */
  ajax (): boolean {
    return nodeReq.ajax(this.request)
  }

  /**
   * tells whether request is pjax or
   * not based on X-PJAX header
   *
   * @return {Boolean}
   *
   * @public
   */
  pjax (): boolean {
    return nodeReq.pjax(this.request)
  }

  /**
   * returns request hostname
   *
   * @uses app.http.subdomainOffset
   *
   * @return {String}
   *
   * @public
   */
  hostname (): string {
    return nodeReq.hostname(this.request, configInstance.get('app.http.trustProxy'))
  }

  /**
   * returns request url without query string
   *
   * @return {String}
   *
   * @public
   */
  url (): string {
    return nodeReq.url(this.request)
  }

  /**
   * returns request original Url with query string
   *
   * @return {String}
   *
   * @public
   */
  originalUrl (): string {
    return nodeReq.originalUrl(this.request)
  }

  /**
   * tells whether request is of certain type
   * based upon Content-type header
   *
   * @return {Boolean}
   *
   * @example
   * request.is('text/html', 'text/plain')
   * request.is(['text/html', 'text/plain'])
   *
   * @public
   */
  is (): boolean {
    const args = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)
    return nodeReq.is(this.request, args)
  }

  /**
   * returns the best response type to be accepted using Accepts header
   *
   * @return {String}
   *
   * @example
   * request.accepts('text/html', 'application/json')
   * request.accepts(['text/html', 'application/json'])
   *
   * @public
   */
  accepts (): string {
    const args = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)
    return nodeReq.accepts(this.request, args)
  }

  /**
   * returns request method or verb in HTTP terms
   *
   * @return {String}
   *
   * @public
   */
  method (): string {
    if (!configInstance.get('app.http.allowMethodSpoofing')) {
      return nodeReq.method(this.request)
    }
    return this.input('_method', this.intended())
  }

  /**
   * Returns the original HTTP request method, regardless
   * of the spoofing input.
   *
   * @returns {String}
   */
  intended (): string {
    return nodeReq.method(this.request)
  }

  /**
   * returns cookie value for a given key
   *
   * @param  {String} key - Key for which value should be returnd
   * @param  {Mixed} defaultValue - default value to return when actual
   *                                 value is undefined or null
   * @return {Mixed}
   *
   * @public
   */
  cookie (key: string, defaultValue: any): any {
    defaultValue = this.util.existy(defaultValue) ? defaultValue : null
    const cookies = this.cookies()
    return this.util.existy(cookies[key]) ? cookies[key] : defaultValue
  }

  /**
   * returns all cookies associated to a given request
   *
   * @return {Object}
   *
   * @public
   */
  cookies (): Object {
    const secret = this.secret || null
    const decrypt = !!this.secret

    /**
     * avoiding re-parsing of cookies if done once
     */
    if (!this.parsedCookies) {
      this.cookiesObject = nodeCookie.parse(this.request, secret, decrypt)
      this.parsedCookies = true
    }

    return this.cookiesObject
  }

  /**
   * Returns an object of plain cookies without decrypting
   * or unsigning them. It is required and helpful when
   * want to read cookies not set by AdonisJs.
   *
   * @return {Object}
   */
  plainCookies (): Object {
    return nodeCookie.parse(this.request)
  }

  /**
   * Returns plain cookie value without decrypting or
   * unsigning it. It is required and helpful when
   * want to read cookies not set by AdonisJs.
   *
   * @param  {String} key
   * @param  {Mixed} [defaultValue]
   *
   * @return {Mixed}
   */
  plainCookie (key: string, defaultValue?: any) {
    defaultValue = this.util.existy(defaultValue) ? defaultValue : null
    const cookies = this.plainCookies()
    return this.util.existy(cookies[key]) ? cookies[key] : defaultValue
  }

  /**
   * return route param value for a given key
   *
   * @param  {String} key - key for which the value should be return
   * @param {Mixed} defaultValue - default value to be returned with actual
   *                               is null or undefined
   * @return {Mixed}
   *
   * @public
   */
  param (key: string, defaultValue?: any): any {
    defaultValue = this.util.existy(defaultValue) ? defaultValue : null
    return this.util.existy(this.params()[key]) ? this.params()[key] : defaultValue
  }

  /**
   * returns all route params
   *
   * @return {Object}
   *
   * @public
   */
  params (): Object {
    return this._params || {}
  }

  /**
   * converts a file object to file instance
   * if already is not an instance
   *
   * @param  {Object}        file
   * @param  {Object} [options]
   * @return {Object}
   * @private
   */
  _toFileInstance (file: Object, options: Object): Object {
    if (!(file instanceof File)) {
      file = new File(file, options)
    }
    return file
  }

  /**
   * returns uploaded file instance for a given key
   * @instance Request.file
   *
   * @param  {String|Number} key
   * @param  {Object} [options]
   * @return {Object}
   *
   * @example
   * request.file('avatar')
   * @public
   */
  file (key: string|number, options?: Object): any {
    /**
     * if requested file was not uploaded return an
     * empty instance of file object.
     */
    if (!this._files[key]) {
      return null
    }

    /**
     * grabbing file from uploaded files and
     * converting them to file instance
     */
    const fileToReturn = this._files[key]

    /**
     * if multiple file upload , convert them to
     * file instances
     */
    // This might fuck shit up
    if (_.isArray(fileToReturn)) {
      return _.map(fileToReturn, (file) => this._toFileInstance(JSON.stringify(file), options))
    }
    return this._toFileInstance(fileToReturn.toJSON(), options)
  }

  /**
   * returns all uploded files by converting
   * them to file instances
   *
   * @return {Array<Object>}
   *
   * @public
   */
  files (): Array<Object> {
    return _.map(this._files, (file, index) => {
      return this.file(index)
    })
  }

  /**
   * tells whether a given pattern matches the current url or not
   *
   * @param  {String} pattern
   * @return {Boolean}
   *
   * @example
   * request.match('/user/:id', 'user/(+.)')
   * request.match(['/user/:id', 'user/(+.)'])
   *
   * @public
   */
  match (any?: string): boolean {
    const args = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)
    const url = this.url()
    const pattern = pathToRegexp(args, [])
    return pattern.test(url)
  }

  /**
   * returns request format enabled by using
   * .formats on routes
   *
   * @return {String}
   *
   * @example
   * request.format()
   *
   * @public
   */
  format (): string {
    return this.param('format') ? this.param('format').replace('.', '') : null
  }

  /**
   * tells whether or not request has body. It can be
   * used by bodyParsers to decide whether or not to parse body
   *
   * @return {Boolean}
   *
   * @public
   */
  hasBody (): boolean {
    return nodeReq.hasBody(this.request)
  }

  /**
   * Returns the request language set via Accept-Language
   * header.
   *
   * @param  {Array} [languages]
   *
   * @return {String}
   */
  language (languages: Array<string>): string {
    return nodeReq.language(this.request, languages)
  }

  /**
   * Returns list of request languages set via Accept-Language
   * header.
   *
   * @return {Array}
   */
  languages (): Array<string> {
    return nodeReq.languages(this.request)
  }

  /**
   * Returns the request encoding set via Accept-Encoding
   * header.
   *
   * @param  {Array} [encodings]
   *
   * @return {String}
   */
  encoding (encodings: Array<string>): string {
    return nodeReq.encoding(this.request, encodings)
  }

  /**
   * Returns list of request encodings set via Accept-Encoding
   * header.
   *
   * @return {Array}
   */
  encodings (): Array<string> {
    return nodeReq.encodings(this.request)
  }

  /**
   * Returns the request charset set via Accept-Charset
   * header.
   *
   * @param  {Array} [encodings]
   *
   * @return {String}
   */
  charset (charsets: Array<string>): string {
    return nodeReq.charset(this.request)
  }

  /**
   * Returns list of request charsets set via Accept-Charset
   * header.
   *
   * @return {Array}
   */
  charsets (): Array<string> {
    return nodeReq.charsets(this.request)
  }

  /**
   * adds a new method to the request prototype
   *
   * @param  {String}   name
   * @param  {Function} callback
   *
   * @public
   */
  static macro (name: string, callback: Function) {
    this.prototype[name] = callback
  }
}

export class RequestBuilder {
  constructor (Config: Config) {
    configInstance = Config
    return Request
  }
}