/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import * as EventEmitter2 from 'eventemitter2'
import { Helpers } from '../Helpers'
import { Config } from '../Config'
import { Ioc } from 'adonis-fold'
import { Resolver } from 'adonis-binding-resolver'
import * as _ from 'lodash'
import { Util } from '../../lib/util'
import { co } from 'co'
import { RuntimeException, InvalidArgumentException, HttpException }  from '../Exceptions'

class Event {
  private listenersPath: string
  private helpers: Helpers
  private namedListeners: string[]
  private listenerLimit: number
  private resolver: Resolver;
  private emitter: EventEmitter2;
  private util: Util;

  constructor (Config: Config, Helpers: Helpers) {
    this.resolver = new Resolver(Ioc.Ioc);

    const options = Config.get('event')
    this.listenersPath = 'Listeners'
    this.helpers = Helpers
    // this.namedListeners = {}
    // this.listenerLimit = null
    this.emitter = new EventEmitter2.EventEmitter2(options);
    this.util = new Util();
  }

  /**
   * here we resolve the handler from the IoC container
   * or the actual callback if a closure was passed.
   *
   * @param  {String|Function}        handler
   * @return {Object|Function}
   *
   * @private
   */
  _resolveHandler (handler: String|Function): Object|Function {
    const formattedHandler = typeof (handler) === 'string' ? this.helpers.makeNameSpace(this.listenersPath, handler) : handler
    return this.resolver.resolveBinding(formattedHandler)
  }

  /**
   * here we bind the instance to the method, only
   * if it exists.
   *
   * @param  {Object}      instance
   * @param  {Function}      method
   * @return {Function}
   *
   * @private
   */
  _bindInstance (instance: any, method: Function): Function {
    return function () {
      instance.emitter = this
      instance.emitter.eventName = instance.emitter.event instanceof Array
                                    ? instance.emitter.event.join(instance.emitter.delimiter)
                                    : instance.emitter.event
      method.apply(instance, arguments)
    }
  }

  /**
   * here we wrap the generator method using co.wrap
   * and make sure to pass the instance to the
   * method.
   *
   * @param  {Object}       instance
   * @param  {Function}       method
   * @return {Function}
   *
   * @private
   */
  _wrapGenerator (instance: any, method: Function): Function {
    return co.wrap(function * () {
      instance.emitter = this
      yield method.apply(instance, arguments)
    })
  }

  /**
   * here we make the handler method with correct context and
   * execution type. It makes it possible to use generator
   * methods and other methods as event handler.
   *
   * @param  {Object|Function}     handler
   * @return {Function}
   *
   * @private
   */
  _makeHandler (handler: any): Function {
    let parentContext = {}
    /**
     * if handler is resolved out of IoC container, it will
     * be an object with the parent context and the method.
     */
    if (typeof (handler) !== 'function' && handler.instance) {
      parentContext = handler.instance
      handler = handler.instance[handler.method]
    }

    /**
     * if handler to the event is a generator, then we need to
     * wrap it inside co with correct context
     */
    if (this.util.isGenerator(handler)) {
      return this._wrapGenerator(parentContext, handler)
    }

    /**
     * otherwise we bind the parentContext to the method
     */
    return this._bindInstance(parentContext, handler)
  }

  /**
   * returns an array of listeners for a specific event
   *
   * @param  {String}     event
   * @return {Array}
   *
   * @public
   */
  getListeners (event: string): Array<Function> {
    return this.emitter.listeners(event)
  }

  /**
   * it should tell whether there are any listeners
   * for a given event or not.
   *
   * @param  {String}     event
   * @return {Boolean}
   *
   * @public
   */
  hasListeners (event: string): boolean {
    return !!this.getListeners(event).length
  }

  /**
   * returns the status for wildcard
   *
   *
   * @return {Boolean}
   *
   * @public
   */
  wildcard (): boolean {
    // return this.emitter.wildcard
    return false
  }

  /**
   * removes a named handler for a given event from the
   * emitter
   *
   * @param  {String}       event
   * @param  {String}       name
   *
   * @public
   */
  removeListener (event: string, name: string): void {
    const handler = this.namedListeners[name]
    if (!handler) {
      throw InvalidArgumentException.missingEvent(event, name)
    }
    // this.emitter.removeListener(event, handler)
  }

  /**
   * removes all listeners for a given or all events
   *
   * @param  {String}        [event]
   *
   * @public
   */
  removeListeners (event: string): void {
    event ? this.emitter.removeAllListeners(event) : this.emitter.removeAllListeners()
  }

  /**
   * emits a given event and passes all the data
   * to the handler
   *
   * @param {...Spread} data
   *
   * @public
   */
  emit (): void {
    const args = _.toArray(arguments)
    this.emitter.emit.apply(this.emitter, args)
  }

  /**
   * @alias emit
   */
  fire (): void {
    this.emit.apply(this, arguments)
  }

  /**
   * binds an handler to any event
   *
   * @param  {Mixed} handler
   *
   * @public
   */
  any (handler: any): void {
    this.resolver.validateBinding(handler)
    handler = this._resolveHandler(handler)
    handler = this._makeHandler(handler)
    this.emitter.onAny(handler)
  }

  /**
   * defines a limit for a listener to be executed
   *
   * @param  {Number} limit
   * @return {Object}
   *
   * @public
   */
  times (limit: number): Object {
    this.listenerLimit = limit
    return this
  }

  /**
   * adds a new event listen for a specific event
   *
   * @param  {String} event
   * @param  {String} name
   * @param  {Mixed} handler
   *
   * @public
   */
  on (event: string, name: string, handler: any): void {
    if (!handler) {
      handler = name
      name = null
    }
    this.resolver.validateBinding(handler)
    handler = this._resolveHandler(handler)
    handler = this._makeHandler(handler)
    if (name) {
      this.namedListeners[name] = handler
    }

    /**
     * if there is a limit define, go with the many
     * method on the emitter
     */
    if (this.listenerLimit) {
      this.emitter.many(event, this.listenerLimit, handler)
      this.listenerLimit = null
      return
    }

    /**
     * otherwise register normally
     */
    this.emitter.on(event, handler)
  }

  /**
   * @alias on
   */
  when (): void {
    this.on.apply(this, arguments)
  }

  /**
   * @alias on
   */
  listen (): void {
    this.on.apply(this, arguments)
  }

  /**
   * adds a new event listen for a specific event
   * to be ran only for one time.
   *
   * @param  {String} event
   * @param  {Mixed} handler
   *
   * @public
   */
  once (event: string, handler: any): void {
    this.resolver.validateBinding(handler)
    handler = this._resolveHandler(handler)
    handler = this._makeHandler(handler)
    this.emitter.once(event, handler)
  }
}