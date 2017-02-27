/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import * as pathToRegexp from 'path-to-regexp';
import * as _ from 'lodash';
import { CatLog } from 'cat-log';
export class RouterHelper {
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
    construct(route, verb, handler, group) {
        this.log = new CatLog('adonis:framework');
        route = route.startsWith('/') ? route : `/${route}`;
        const pattern = this.makeRoutePattern(route);
        const middlewares = [];
        const domain = null;
        const name = route;
        verb = _.isArray(verb) ? verb : [verb]; // a route can register for multiple verbs
        return { route, verb, handler, pattern, middlewares, name, group, domain };
    }
    /**
     * make regex pattern for a given route
     *
     * @param  {String} route
     * @return {Regex}
     *
     * @private
     */
    makeRoutePattern(route) {
        return pathToRegexp(route, []);
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
    returnMatchingRouteToUrl(routes, urlPath, verb) {
        let maps = _.filter(routes, function (route) {
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
    returnRouteArguments(route, urlPath) {
        let routeShallowCopy = _.clone(route);
        let extracted = routeShallowCopy.pattern.exec(urlPath);
        routeShallowCopy.params = {};
        _.map(routeShallowCopy.pattern.keys, function (key, index) {
            routeShallowCopy.params[key.name] = extracted[index + 1];
        });
        return routeShallowCopy;
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
    compileRouteToUrl(route, values) {
        return pathToRegexp.compile(route)(values);
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
    appendMiddleware(routes, middlewares) {
        if (_.isArray(routes)) {
            _.each(routes, function (route) {
                route.middlewares = route.middlewares.concat(middlewares);
            });
        }
        else {
            routes.middlewares = routes.middlewares.concat(middlewares);
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
    addFormats(routes, formats, strict) {
        const flag = strict ? '' : '?';
        const formatsPattern = `:format(.${formats.join('|.')})${flag}`;
        if (_.isArray(routes)) {
            _.each(routes, function (route) {
                route.route = `${route.route}${formatsPattern}`;
                route.pattern = route.makeRoutePattern(route.route);
            });
        }
        else {
            routes.route = `${routes.route}${formatsPattern}`;
            routes.pattern = routes.makeRoutePattern(routes.route);
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
    prefixRoute(routes, prefix) {
        prefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
        _.each(routes, function (route) {
            route.route = route.route === '/' ? prefix : prefix + route.route;
            route.pattern = this.makeRoutePattern(route.route);
            return route;
        });
    }
    /**
     * adds domain to group of routes.
     *
     * @param  {Array}     routes
     * @param  {String}     domain
     *
     * @private
     */
    addDomain(routes, domain) {
        _.each(routes, function (route) {
            route.domain = domain;
        });
    }
}
