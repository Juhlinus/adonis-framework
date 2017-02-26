/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
"use strict";
var _ = require("lodash");
var Util = (function () {
    function Util() {
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
    Util.prototype.existy = function (value) {
        return value !== undefined && value !== null;
    };
    /**
     * @description returns an array from method arguments
     *
     * @method spread
     *
     * @return {Array}
     *
     * @private
     */
    Util.prototype.spread = function () {
        return _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments);
    };
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
    Util.prototype.isGenerator = function (method) {
        var viaToStr = this.toStr.call(method);
        var viaFnToStr = this.fnToStr.call(method);
        return (viaToStr === '[object Function]' || viaToStr === '[object GeneratorFunction]') && this.isFnRegex.test(viaFnToStr);
    };
    return Util;
}());
exports.Util = Util;
