/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { RouterHelper } from './helpers'
import { CatLog } from 'cat-log'
import { Util } from '../../lib/util'
import { Resource } from './resource'

class ResourceMember extends Resource {
  public log: CatLog
  public helpers: RouterHelper

  constructor (route: any) {
    super(route, '', '')

    this.log = super.log
    this.route = super.route
    this.helpers = super.helpers
  }

  /**
   * binds action to the route, it will override
   * the old action
   *
   * @param  {String|Function} action
   *
   * @return {Object}
   *
   * @public
   */
  bindAction (action: string): Object {
    super.handler = action
    return this
  }

  /**
   * @see this.middleware
   */
  middlewares () {
    this.log.warn('member@middlewares: consider using method middleware, instead of middlewares')
    return this.middleware.apply(this, arguments)
  }

  /**
   * appends middlewares to the route
   *
   * @return {Object}
   *
   * @public
   */
  middleware (): Object {
    this.helpers.appendMiddleware(
      this.route,
      this.util.spread.apply(this, arguments)
    )
    return this
  }

  /**
   * assign name to the route
   *
   * @param  {String} name
   *
   * @return {Object}
   *
   * @public
   */
  as (name: string): this {
    // this.route.name = name
    return this
  }

  /**
   * return json representation of the route
   *
   * @return {Object}
   *
   * @public
   */
  toJSON (): Object {
    return this.route
  }
}