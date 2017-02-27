/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { pathToRegexp } from 'path-to-regexp'
import * as _ from 'lodash'

export class RouterHelper {
  private pattern: RegExp

  /**
   * construct a new route using path-to-regexp
   *
   * @param  {String}   route
   * @param  {String}   verb
   * @param  {Any}      handler
   *
   * @return {Object}
   * @private
   */
  construct(route: any, verb: Array<string>, handler: any, group: any): Object {
    route = route.startsWith('/') ? route : `/${route}`
    const pattern = this.makeRoutePattern(route)
    const middlewares = []
    const domain = null
    const name = route

    verb = _.isArray(verb) ? verb : [verb] // a route can register for multiple verbs
    return { route, verb, handler, pattern, middlewares, name, group, domain }
  }

  /**
   * make regex pattern for a given route
   *
   * @param  {String} route
   * @return {Regex}
   *
   * @private
   */
  makeRoutePattern(route: string): RegExp {
    return pathToRegexp(route, [])
  }

  /**
   * resolve route from routes store based upon current url
   *
   * @param  {Object} routes
   * @param  {String} url
   * @param  {String} verb
   * @return {Object}
   *
   * @private
   */
  returnMatchingRouteToUrl(routes: Array<Object>, urlPath: string, verb: string): Object {
    let maps: any = _.filter(routes, function (route: any) {
      if (route.domain) {
        route.pattern = route.makeRoutePattern(route.domain + route.route)
      }
      return (route.pattern.test(urlPath) && _.includes(route.verb, verb))
    })
    maps = maps[0] || {}
    if (maps.verb) {
      maps.matchedVerb = verb
    } // define which verb has been matched while resolving route
    return maps
  }

  /**
   * return params passed to a given resolved route
   *
   * @param  {Object} route
   * @param  {String} urlPath
   * @return {Object}
   *
   * @private
   */
  returnRouteArguments(route: Object, urlPath: String): Object {
    let routeShallowCopy: any = _.clone(route)
    let extracted = routeShallowCopy.pattern.exec(urlPath)
    routeShallowCopy.params = {}

    _.map(routeShallowCopy.pattern.keys, function (key: any, index: number) {
      routeShallowCopy.params[key.name] = extracted[index + 1]
    })
    return routeShallowCopy
  }

  /**
   * return compiled url based on input route
   *
   * @param  {String} route
   * @param  {Object} values
   * @return {String}
   *
   * @private
   */
  compileRouteToUrl(route: Array<string>, values: Object): string {
    return pathToRegexp.compile(route)(values)
  }

  /**
   * general purpose method to append new middlewares to
   * a route or group of routes
   * @method appendMiddleware
   * @param  {Array|Object}         routes
   * @param  {Array}         middlewares
   * @return {void}
   * @private
   */
  appendMiddleware(routes: any, middlewares: Array<any>): void {
    if (_.isArray(routes)) {
      _.each(routes, function (route: any) {
        route.middlewares = route.middlewares.concat(middlewares)
      })
    } else {
      routes.middlewares = routes.middlewares.concat(middlewares)
    }
  }

  /**
   * adds formats to routes or an array of routes
   *
   * @param  {Array|Object}   routes
   * @param  {Array}   format
   * @param  {Boolean}   strict
   * @private
   */
  addFormats(routes: any, formats: Array<string>, strict: boolean) {
    const flag = strict ? '' : '?'
    const formatsPattern = `:format(.${formats.join('|.')})${flag}`
    if (_.isArray(routes)) {
      _.each(routes, function (route: any) {
        route.route = `${route.route}${formatsPattern}`
        route.pattern = route.makeRoutePattern(route.route)
      })
    } else {
      routes.route = `${routes.route}${formatsPattern}`
      routes.pattern = routes.makeRoutePattern(routes.route)
    }
  }

  /**
   * general purpose method to prefix group of routes
   *
   * @param  {Array}    routes
   * @param  {String}    prefix
   * @return {void}
   *
   * @private
   */
  prefixRoute(routes: Array<string>, prefix: string): void {
    prefix = prefix.startsWith('/') ? prefix : `/${prefix}`
    _.each(routes, function (route: any) {
      route.route = route.route === '/' ? prefix : prefix + route.route
      route.pattern = this.makeRoutePattern(route.route)
      return route
    })
  }

  /**
   * adds domain to group of routes.
   *
   * @param  {Array}     routes
   * @param  {String}     domain
   *
   * @private
   */
  addDomain(routes: Array<string>, domain: string) {
    _.each(routes, function (route: any) {
      route.domain = domain
    })
  }
}