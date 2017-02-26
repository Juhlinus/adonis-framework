/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import * as _ from 'lodash';
export class Util {
    constructor() {
        this.toStr = Object.prototype.toString;
        this.fnToStr = Function.prototype.toString;
        this.isFnRegex = /^\s*(?:function)?\*/;
    }
    /**
     * tells whether value exists or not by checking
     * it type
     *
     * @param  {Mixed} value
     * @return {Boolean}
     *
     * @private
     */
    existy(value) {
        return value !== undefined && value !== null;
    }
    /**
     * @description returns an array from method arguments
     *
     * @method spread
     *
     * @return {Array}
     *
     * @private
     */
    spread() {
        return _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments);
    }
    /**
     * tells whether a method is a genetator function or
     * not
     *
     * @method isGenerator
     *
     * @param  {Function}    method
     * @return {Boolean}
     *
     * @private
     */
    isGenerator(method) {
        const viaToStr = this.toStr.call(method);
        const viaFnToStr = this.fnToStr.call(method);
        return (viaToStr === '[object Function]' || viaToStr === '[object GeneratorFunction]') && this.isFnRegex.test(viaFnToStr);
    }
}
