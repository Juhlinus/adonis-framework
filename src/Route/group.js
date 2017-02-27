/**
 * Route groups to keep configuration DRY for bunch of
 * routes.
 * @class
 * @alias Route.Group
 */
export class Group {
    constructor(routes) {
        this.routes = routes;
    }
    /**
     * @see module:Route~middlewares
     */
    middlewares() {
        this.helpers.appendMiddleware(this.routes, this.util.spread.apply(this, arguments));
        return this;
    }
    /**
     * @see module:Route~middleware
     */
    middleware() {
        return this.middlewares.apply(this, arguments);
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
    prefix(pattern) {
        this.helpers.prefixRoute(this.routes, pattern);
        return this;
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
    domain(domain) {
        this.domains.add(this.helpers.makeRoutePattern(domain));
        this.helpers.addDomain(this.routes, domain);
    }
    /**
     * @see module:Route~formats
     */
    formats(formats, strict) {
        this.helpers.addFormats(this.routes, formats, strict);
        return this;
    }
}
