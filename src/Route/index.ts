/**
 * adonis-framework
 * Copyright(c) 2015-2016 Harminder Virk
 * MIT Licensed
*/

import { RouterHelper as helper } from './helpers'
import { Group } from './group'
import { Resource } from './resource'
import { domains } from './domains'
import { Util } from '../../lib/util'
import * as  _ from 'lodash'
import { CatLog } from 'cat-log'

/**
 * Create and register routes using regular expressions
 * @module Route
 */
export class Route {
  private log: CatLog
  private util: Util
  private _routes: Array<string>
  private activeGroup: string
  private resources: Object

  constructor() {
    this.log = new CatLog('adonis:framework')
    /**
     * holding reference to registered routes
     * @type {Array}
     * @private
     */
    this.routes = []
    /**
     * holding reference to active Group
     * @type {String}
     * @private
     */
    this.activeGroup = null

    this.resources = this.resource
  }

  /**
   * return all registered routes
   *
   * @method routes
   * @return {Object}
   *
   * @public
   */
  get routes():Array<string> { return this._routes }
  set routes(value:Array<string>) { this._routes = value }

  /**
   * clear registered routes and other local variables
   *
   * @method new
   *
   * @public
   */
  new(): void {
    this.activeGroup = null
    this.routes = []
  }

  /**
   * a low level method to register route with path,verb
   * and handler
   *
   * @method route
   *
   * @param {String} route - route expression
   * @param {Array<String>} verb - http verb/method
   * @param {any} handler - handler to respond to a given request
   * @return {Object}
   * 
   * @example
   * Route.route('/welcome', 'GET', function * () {
   *
   * })
   *
   * @public
   */
  route(route: string, verb: Array<string>, handler: any): Object {
    let constructedRoute = helpers.construct(route, verb, handler, this.activeGroup)
    this.routes.push(constructedRoute)
    return this
  }

  /**
   * register route with GET verb
   *
   * @method get
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   * @return {Object}
   * 
   * @example
   * Route.get('/user', function * () {
   *
   * })
   *
   * @public
   */
  get(route: string, handler: any): Object {
    this.route(route, ['GET', 'HEAD'], handler)
    return this
  }

  /**
   * registers a get route with null handler
   * which later can be used with render
   * method to render a view.
   *
   * @method on
   *
   * @param  {String} route
   * @return {Object}
   *
   * @public
   */
  on(route): Object {
    this.get(route, null)
    return this
  }

  /**
   * Replaces the route handler method with a custom
   * closure, to send a given view.
   *
   * @method render
   *
   * @param  {String} view
   * @return {Object}
   *
   * @public
   */
  render(view: string): Object {
    var route:any = this._lastRoute()
    route.handler = function* (request, response) {
      yield response.sendView(view, { request })
    }
    return this
  }

  /**
   * register route with POST verb
   *
   * @method post
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.post('/user', function * () {
   *
   * })
   *
   * @public
   */
  post(route:any, handler: any) {
    this.route(route, ['POST'], handler)
    return this
  }

  /**
   * register route with PUT verb
   *
   * @method put
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.put('/user/:id', function * () {
   *
   * })
   *
   * @public
   */
  put(route: any, handler: any) {
    this.route(route, ['PUT'], handler)
    return this
  }

  /**
   * register route with PATCH verb
   *
   * @method patch
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.patch('/user/:id', function * () {
   *
   * })
   *
   * @public
   */
  patch(route: any, handler: any) {
    this.route(route, ['PATCH'], handler)
    return this
  }

  /**
   * register route with DELETE verb
   *
   * @method delete
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.delete('/user/:id', function * () {
   *
   * })
   *
   * @public
   */
  delete = function (route: any, handler: any) {
    this.route(route, ['DELETE'], handler)
    return this
  }

  /**
   * register route with OPTIONS verb
   *
   * @method options
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.put('/user/:id', function * () {
   *
   * })
   *
   * @public
   */
  options = function (route: any, handler: any) {
    this.route(route, ['OPTIONS'], handler)
    return this
  }

  /**
   * registers a route with multiple HTTP verbs
   *
   * @method match
   *
   * @param  {Array} verbs - an array of verbs
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.match(['GET', 'POST'], '/user', function * () {
   *
   * })
   *
   * @public
   */
  match = function (verbs: Array<string>, route: any, handler: any) {
    verbs = _.map(verbs, function (verb) { return verb.toUpperCase() })
    this.route(route, verbs, handler)
    return this
  }

  /**
   * registers route for all http verbs
   *
   * @method any
   *
   * @param  {String} route - route expression
   * @param {any} handler - handler to respond to a given request
   *
   * @example
   * Route.any('/user', function * () {
   *
   * })
   *
   * @public
   */
  any(route: any, handler: any) {
    const verbs = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    this.route(route, verbs, handler)
    return this
  }

  /**
   * giving unique name to a registered route
   *
   * @method as
   *
   * @param  {String} name - name for recently registered route
   *
   * @example
   * Route.get('/user/:id', '...').as('getUser')
   *
   * @public
   */
  as(name: string) {
    let lastRoute: any = this._lastRoute()
    lastRoute.name = name
    return this
  }

  /**
   * returns last route registered inside the route store
   *
   * @method lastRoute
   *
   * @return {Object}
   *
   * @private
   */
  _lastRoute(): Object {
    return _.last(this.routes)
  }

  /**
   * assign array of named middlewares to route
   *
   * @method middleware
   * @synonym middleware
   *
   * @param  {Mixed} keys - an array of middleware or multiple parameters
   * @return {Object} - reference to this for chaining
   *
   * @example
   * Route.get('...').middleware('auth', 'csrf')
   * Route.get('...').middleware(['auth', 'csrf'])
   *
   * @public
   */
  middleware(): Object {
    helpers.appendMiddleware(
      this._lastRoute(),
      this.util.spread.apply(this, arguments)
    )
    return this
  }

  /**
   * @see module:Route~middleware
   */
  middlewares() {
    this.log.warn('route@middlewares: consider using method middleware, instead of middlewares')
    this.middleware.apply(Route, arguments)
  }

  /**
   * create a new group of routes to apply rules on a group
   * instead of applying them on every route.
   *
   * @method group
   *
   * @param  {String}   name - unqiue name for group
   * @param  {Function} cb - Callback to isolate group
   * @returns {Route.Group} - Instance of route group
   *
   * @example
   * Route.group('v1', function () {
   *
   * }).prefix('/v1').middleware('auth')
   * @public
   */
  group(name: string, cb: Function): any {
    this.activeGroup = name
    cb()
    const groupRoutes = _.filter(this.routes, function (route: any) {
      return route.group === this.activeGroup
    })
    this.activeGroup = null
    return new Group(groupRoutes)
  }

  /**
   * resolves route for a given url and HTTP verb/method
   *
   * @method resolve
   *
   * @param  {String} urlPath - Path to url
   * @param  {String} verb - Http verb
   * @param  {String} host - Current host
   *
   * @return {Object}
   *
   * @example
   * Route.resolve('/user/1', 'GET', 'localhost')
   *
   * @public
   */
  resolve(urlPath: string, verb: string, host: string): Object {
    if (domains.match(host)) {
      urlPath = `${host}${urlPath}`
    }
    let resolvedRoute = helpers.returnMatchingRouteToUrl(this.routes, urlPath, verb)
    if (_.size(resolvedRoute) === 0) {
      return {}
    }
    return helpers.returnRouteArguments(resolvedRoute, urlPath, host)
  }

  /**
   * creates a resource of routes based out of conventions
   *
   * @method resource
   * @alias resources
   *
   * @param  {String} name - Resource name
   * @param  {String} controller - Controller to handle resource requests
   * @returns {Route.resources} - Instance of Resources class
   *
   * @example
   * Route.resource('user', 'UserController')
   * Route.resource('post.comments', 'CommentsController')
   *
   * @public
   */
  resource(name: string, controller: string): any {
    return new Resource(Route, name, controller)
  }

  /**
   * creates a valid url based on route pattern and parameters and params
   *
   * @method url
   *
   * @param  {String} pattern
   * @param  {Object} params
   * @return {String}
   *
   * @example
   * Route.url('user/:id', {id: 1})
   *
   * @public
   */
  url(pattern: string, params: object): string {
    const namedRoute = _.filter(this.routes, function (route: any) {
      return route.name === pattern
    })[0]

    /**
     * if found pattern as a named route, make it using
     * route properties
     */
    if (namedRoute) {
      const resolveRoute = namedRoute.domain ? `${namedRoute.domain}${namedRoute.route}` : namedRoute.route
      return helpers.compileRouteToUrl(resolveRoute, params)
    }
    return helpers.compileRouteToUrl(pattern, params)
  }

  /**
   * returns a route with it's property
   *
   * @method getRoute
   * @param  {Object} property
   *
   * @example
   * Route.getRoute({name: 'user.show'})
   * Route.getRoute({handler: 'UserController.show'})
   *
   * @return {Object}
   */
  getRoute(property: Object): Object {
    const index = _.findIndex(this.routes, property)
    return this.routes[index]
  }

  /**
   * removes a route from routes mapping using it's name
   *
   * @method remove
   *
   * @param  {String} name
   *
   * @example
   * Route.remove('user.create')
   *
   * @public
   */
  remove(name: string) {
    const index = _.findIndex(this.routes, { name })
    this.routes.splice(index, 1)
  }

  /**
   * add formats paramters to route defination which makes
   * url to have optional extensions at the end of them.
   *
   * @method formats
   *
   * @param  {Array} formats - array of supported supports
   * @param  {Boolean} [strict=false] - Using strict mode will not register
   *                                    a plain route without any extension
   *
   * @example
   * Route.get('/user', '...').formats(['json', 'xml'])
   *
   * @public
   */
  formats(formats: Array<string>, strict: boolean) {
    const lastRoute = this._lastRoute()
    helpers.addFormats(lastRoute, formats, strict)
  }
}
