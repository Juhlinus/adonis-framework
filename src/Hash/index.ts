/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import * as bcrypt from 'bcryptjs'

/**
 * Create and verify hash values using Bcrypt as underlaying
 * algorithm.
 * @module Hash
 */
export class Hash {
  /**
   * hash a value with given number of rounds
   *
   * @method make
   * @param  {String} value - value to hash
   * @param  {Number} [rounds=10] - number of rounds to be used for creating hash
   *
   * @return {Promise}
   *
   * @public
   *
   * @example
   * yield Hash.make('somepassword')
   * yield Hash.make('somepassword', 5)
   */
  make(value: string, rounds: number): Promise<Object> {
    rounds = rounds || 10
    return new Promise(function (resolve, reject) {
      bcrypt.hash(value, rounds, function (error, hash) {
        if (error) {
          return reject(error)
        }
        resolve(hash)
      })
    })
  }

  /**
   * verifies a given value against hash value
   *
   * @method verify
   * @param  {String} value - Plain value
   * @param  {String} hash - Previously hashed value
   *
   * @return {Promise}
   *
   * @public
   *
   * @example
   * yield Hash.verify('plainpassword', 'hashpassword')
   */
  verify(value: string, hash: string): Promise<Object> {
    return new Promise(function (resolve, reject) {
      bcrypt.compare(value, hash, function (error, response) {
        if (error) {
          return reject(error)
        }
        resolve(response)
      })
    })
  }
}