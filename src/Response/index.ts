/**
 * adonis-framework
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/
import { nodeRes } from 'node-res'
import { nodeCookie } from 'node-cookie'
import { View } from '../View'
import { Config } from '../Config'
import { Route } from '../Route'
import * as http from 'http'

let viewInstance: View
let routeInstance: Route
let configInstance: Config

/**
 * Glued http response to end requests by sending
 * proper formatted response.
 * @class
 */
class Response {
  
  private request: Object
  private response: http.ServerResponse

  private _finished: boolean

  constructor (request: http.IncomingMessage, response: http.ServerResponse) {
    this.request = request
    this.response = response
    if (configInstance.get('app.http.setPoweredBy', true)) {
      nodeRes.header(this.response, 'X-Powered-By', 'AdonisJs')
    }
    nodeRes.descriptiveMethods.forEach((method) => {
      this[method] = (body) => {
        nodeRes[method](this.request, this.response, body)
      }
    })
  }

  /**
   * returns whether request has been
   * finished or not
   *
   * @method finished
   *
   * @return {Boolean}
   */
  get finished (): boolean {
    return this.response.finished
  }

  /**
   * returns whether request headers
   * have been sent or not
   *
   * @method headersSent
   *
   * @return {Boolean}
   */
  get headersSent (): boolean {
    return this.response.headersSent
  }

  /**
   * returns whether a request is pending
   * or not
   *
   * @method isPending
   *
   * @return {Boolean}
   */
  get isPending (): boolean {
    return (!this.headersSent && !this.finished)
  }

  /**
   * sets key/value pair on response header
   *
   * @param  {String} key - key to set value for
   * @param  {Mixed} value - key to save corresponding to given key
   * @return {Object} - Reference to class instance for chaining methods
   *
   * @example
   * response.header('Content-type', 'application/json')
   *
   * @public
   */
  header (key: string, value: any): Object {
    nodeRes.header(this.response, key, value)
    return this
  }

  /**
   * creates a new view using View class
   * @async
   *
   * @param  {String} template
   * @param  {Object} options
   * @returns {Html} - compiled html template
   *
   * @example
   * yield response.view('index')
   * yield response.view('profile', {name: 'doe'})
   *
   * @public
   */
  * view (template: string, options: Object): any  {
    return viewInstance.make(template, options)
  }

  /**
   * creates a new view using View class and ends the
   * response by sending compilied html template
   * back as response content.
   *
   * @param  {String} template
   * @param  {Object} options
   *
   * @example
   * yield response.sendView('index')
   * yield response.sendView('profile', {name: 'doe'})
   * @public
   */
  * sendView (template: string, options: Object) {
    const view = yield this.view(template, options)
    this.send(view)
  }

  /**
   * removes previously added header.
   *
   * @param  {String}     key
   * @return {Object} - reference to class instance for chaining
   *
   * @example
   * response.removeHeader('Accept')
   *
   * @public
   */
  removeHeader (key: string): Object {
    nodeRes.removeHeader(this.response, key)
    return this
  }

  /**
   * set's response status, make it adhers to RFC specifications
   *
   * @see {@link https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html}
   *
   * @param  {Number} statusCode
   * @return {Object} - reference to class instance for chaining
   *
   * @example
   * response.status(200)
   * @public
   */
  status (statusCode: number): Object {
    nodeRes.status(this.response, statusCode)
    return this
  }

  /**
   * ends response, should not be used with
   * send method
   *
   * @public
   */
  end (): void {
    nodeRes.end(this.response)
  }

  /**
   * writes content to response and sends it back as
   * response body
   *
   * @param  {Mixed} body
   *
   * @public
   */
  send (body: any): void {
    nodeRes.send(http.request, this.response, body)
  }

  /**
   * writes json response using send method and sets content-type
   * to application/json
   *
   * @param  {Object} body
   *
   * @public
   */
  json (body: Object): void {
    nodeRes.json(http.request, this.response, body)
  }

  /**
   * writes jsonp response using send method and sets content-type
   * to text/javascript
   *
   * @uses app.http.jsonpCallback
   * @param  {Object} body
   *
   * @public
   */
  jsonp (body: Object): void {
    // const callback = http.request.input('callback') || configInstance.get('app.http.jsonpCallback')
    // nodeRes.jsonp(this.request.request, this.response, body, callback)
  }

  /**
   * streams file content to response and ends request
   * once done.
   *
   * @param  {String} filePath - path to file from where to read contents
   *
   * @example
   * response.download('absolute/path/to/file')
   *
   * @public
   */
  download (filePath: string): void {
    nodeRes.download(this.request, this.response, filePath)
  }

  /**
   * force download input file by setting content-disposition
   *
   * @param  {String}   filePath - path to file from where to read contents
   * @param  {String}   name - downloaded file name
   * @param  {String}   [disposition=attachment] - content disposition
   *
   * @example
   * response.attach('absolute/path/to/file', 'name')
   *
   * @public
   */
  attachment (filePath: string, name: string, disposition: string): void {
    nodeRes.attachment(this.request, this.response, filePath, name, disposition)
  }

  /**
   * sets location header on response
   *
   * @param  {String} toUrl
   * @return {Object} - reference to class instance for chaining
   *
   * @public
   */
  location (toUrl: string): Object {
    if (toUrl === 'back') {
      // toUrl = this.request.header('Referrer') || '/'
    }
    nodeRes.location(this.response, toUrl)
    return this
  }

  /**
   * redirect request to a given url and ends the request
   *
   * @param  {String} toUrl - url to redirect to
   * @param  {Number} [status=302] - http status code
   *
   */
  redirect (toUrl: string, status: number): void {
    if (toUrl === 'back') {
      toUrl = /* this.request.header('Referrer') || */ '/'
    }
    // nodeRes.redirect(this.request.request, this.response, toUrl, status)
  }

  /**
   * sets vary header on response
   *
   * @param  {String} field
   * @return {Object} - reference to class instance for chaining
   */
  vary (field: string): Object {
    nodeRes.vary(this.response, field)
    return this
  }

  /**
   * redirects to a registered route from routes.js files
   *
   * @param  {String} route - name of the route
   * @param  {Object} data - route params
   * @param  {Number} [status=302] - http status code
   *
   * @example
   * response.route('/profile/:id', {id: 1})
   * response.route('user.profile', {id: 1})
   * @public
   */
  route (route: Array<string>, data: Object, status: number): void {
    const toUrl = routeInstance.url(route, data)
    this.redirect(toUrl, status)
  }

  /**
   * adds new cookie to response cookies
   *
   * @param  {String} key - cookie name
   * @param  {Mixed} value - value to be saved next for cookie name
   * @param  {Object} options - options to define cookie path,host age etc.
   * @return {Object} - reference to class instance for chaining
   *
   * @example
   * response.cookie('cart', values)
   * response.cookie('cart', values, {
   *   maxAge: 1440,
   *   httpOnly: false
   * })
   *
   * @public
   */
  cookie (key: string, value: any, options: Object): Object {
    const secret = configInstance.get('app.appKey')
    const encrypt = !!secret
    // nodeCookie.create(this.request.request, this.response, key, value, options, secret, encrypt)
    return this
  }

  /**
   * Set a plain non-encrypted cookie on the response
   *
   * @param  {String} key
   * @param  {Mixed} value
   * @param  {Object} [options]
   * @return  {Object} 
   * 
   * @example
   * Response.plainCookie('foo', 'bar')
   */
  plainCookie (key: string, value: any, options: Object): Object {
    // nodeCookie.create(this.request.request, this.response, key, value, options)
    return this
  }

  /**
   * clears existing cookie from response header
   *
   * @param  {String}    key
   * @param  {Object}    options
   *
   * @return {Object} - reference to class instance for chaining
   */
  clearCookie (key: string, options: Object): Object {
    // nodeCookie.clear(this.request.request, this.response, key, options)
    return this
  }

  /**
   * adds a new method to the response prototype
   *
   * @param  {String}   name
   * @param  {Function} callback
   *
   * @public
   */
  static macro (name: string, callback: Function): void {
    this.prototype[name] = callback
  }

}

export class ResponseBuilder {
  constructor (View: View, Route: Route, Config: Config) {
    viewInstance = View
    routeInstance = Route
    configInstance = Config
    return Response
  }
}