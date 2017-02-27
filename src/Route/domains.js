/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/ export class Domains {
    /**
     * pushes a new domain to registeredDomains
     *
     * @param  {String} domain
     *
     * @private
     */
    add(domain) {
        this.registeredDomains.push(domain);
    }
    /**
     * returns domains matching to a given
     * host
     *
     * @param  {String} host
     * @return {Boolean}
     *
     * @private
     */
    match(host) {
        let isDomain = false;
        this.registeredDomains.forEach(function (domain) {
            if (domain.test(host)) {
                isDomain = true;
            }
        });
        return isDomain;
    }
}
