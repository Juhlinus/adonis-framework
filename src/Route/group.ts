/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import { RouterHelper } from './helpers';
import { Domains } from './domains';
import { Util } from '../../lib/util'

/**
 * Route groups to keep configuration DRY for bunch of
 * routes.
 * @class
 * @alias Route.Group
 */
export class Group {
  private routes: Array<string>
  private helpers: RouterHelper
  private domains: Domains
  private util: Util

  constructor (routes: any) {
    this.routes = routes
  }

  /**
   * @see module:Route~middlewares
   */
  middlewares (): any {
    this.helpers.appendMiddleware(
      this.routes,
      this.util.spread.apply(this, arguments)
    )
    return this
  }

  /**
   * @see module:Route~middleware
   */
  middleware () {
    return this.middlewares.apply(this, arguments)
  }

  /**
   * prefix group of routes with a given pattern
   *
   * @param  {String} pattern
   *
   * @return {Object} - reference to this for chaining
   *
   * @example
   * Route.group('...').prefix('/v1')
   *
   * @public
   */
  prefix (pattern: string): Object {
    this.helpers.prefixRoute(this.routes, pattern)
    return this
  }

  /**
   * add domain to group of routes. All routes inside the group
   * will be matched on define domain
   *
   * @param  {String} domain
   * @return {Object} - reference to this for chaining
   *
   * @example
   * Route.group('...').domain(':user.example.com')
   *
   * @public
   */
  domain (domain: string): void {
    this.domains.add(this.helpers.makeRoutePattern(domain))
    this.helpers.addDomain(this.routes, domain)
  }

  /**
   * @see module:Route~formats
   */
  formats (formats: Array<string>, strict: boolean) {
    this.helpers.addFormats(this.routes, formats, strict)
    return this
  }
}