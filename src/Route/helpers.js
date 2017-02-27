/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
"use strict";
var path_to_regexp_1 = require("path-to-regexp");
var _ = require("lodash");
var RouterHelper = (function () {
    function RouterHelper() {
    }
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
    RouterHelper.prototype.construct = function (route, verb, handler, group) {
        route = route.startsWith('/') ? route : "/" + route;
        var pattern = this.makeRoutePattern(route);
        var middlewares = [];
        var domain = null;
        var name = route;
        verb = _.isArray(verb) ? verb : [verb]; // a route can register for multiple verbs
        return { route: route, verb: verb, handler: handler, pattern: pattern, middlewares: middlewares, name: name, group: group, domain: domain };
    };
    /**
     * make regex pattern for a given route
     *
     * @param  {String} route
     * @return {Regex}
     *
     * @private
     */
    RouterHelper.prototype.makeRoutePattern = function (route) {
        return path_to_regexp_1.pathToRegexp(route, []);
    };
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
    RouterHelper.prototype.returnMatchingRouteToUrl = function (routes, urlPath, verb) {
        var maps = _.filter(routes, function (route) {
            if (route.domain) {
                route.pattern = route.makeRoutePattern(route.domain + route.route);
            }
            return (route.pattern.test(urlPath) && _.includes(route.verb, verb));
        });
        maps = maps[0] || {};
        if (maps.verb) {
            maps.matchedVerb = verb;
        } // define which verb has been matched while resolving route
        return maps;
    };
    /**
     * return params passed to a given resolved route
     *
     * @param  {Object} route
     * @param  {String} urlPath
     * @return {Object}
     *
     * @private
     */
    RouterHelper.prototype.returnRouteArguments = function (route, urlPath) {
        var routeShallowCopy = _.clone(route);
        var extracted = routeShallowCopy.pattern.exec(urlPath);
        routeShallowCopy.params = {};
        _.map(routeShallowCopy.pattern.keys, function (key, index) {
            routeShallowCopy.params[key.name] = extracted[index + 1];
        });
        return routeShallowCopy;
    };
    /**
     * return compiled url based on input route
     *
     * @param  {String} route
     * @param  {Object} values
     * @return {String}
     *
     * @private
     */
    RouterHelper.prototype.compileRouteToUrl = function (route, values) {
        return path_to_regexp_1.pathToRegexp.compile(route)(values);
    };
    /**
     * general purpose method to append new middlewares to
     * a route or group of routes
     * @method appendMiddleware
     * @param  {Array|Object}         routes
     * @param  {Array}         middlewares
     * @return {void}
     * @private
     */
    RouterHelper.prototype.appendMiddleware = function (routes, middlewares) {
        if (_.isArray(routes)) {
            _.each(routes, function (route) {
                route.middlewares = route.middlewares.concat(middlewares);
            });
        }
        else {
            routes.middlewares = routes.middlewares.concat(middlewares);
        }
    };
    /**
     * adds formats to routes or an array of routes
     *
     * @param  {Array|Object}   routes
     * @param  {Array}   format
     * @param  {Boolean}   strict
     * @private
     */
    RouterHelper.prototype.addFormats = function (routes, formats, strict) {
        var flag = strict ? '' : '?';
        var formatsPattern = ":format(." + formats.join('|.') + ")" + flag;
        if (_.isArray(routes)) {
            _.each(routes, function (route) {
                route.route = "" + route.route + formatsPattern;
                route.pattern = route.makeRoutePattern(route.route);
            });
        }
        else {
            routes.route = "" + routes.route + formatsPattern;
            routes.pattern = routes.makeRoutePattern(routes.route);
        }
    };
    /**
     * general purpose method to prefix group of routes
     *
     * @param  {Array}    routes
     * @param  {String}    prefix
     * @return {void}
     *
     * @private
     */
    RouterHelper.prototype.prefixRoute = function (routes, prefix) {
        prefix = prefix.startsWith('/') ? prefix : "/" + prefix;
        _.each(routes, function (route) {
            route.route = route.route === '/' ? prefix : prefix + route.route;
            route.pattern = this.makeRoutePattern(route.route);
            return route;
        });
    };
    /**
     * adds domain to group of routes.
     *
     * @param  {Array}     routes
     * @param  {String}     domain
     *
     * @private
     */
    RouterHelper.prototype.addDomain = function (routes, domain) {
        _.each(routes, function (route) {
            route.domain = domain;
        });
    };
    return RouterHelper;
}());
exports.RouterHelper = RouterHelper;
