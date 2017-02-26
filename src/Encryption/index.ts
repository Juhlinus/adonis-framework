/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import * as crypto from 'crypto'
import { Config } from '../Config'
import { RuntimeException, InvalidArgumentException, HttpException }  from '../Exceptions'

type Utf8AsciiBinaryEncoding = "utf8" | "ascii" | "binary"

/**
 * Encrypt and decrypt values using nodeJs crypto, make
 * sure to set APP_KEY inside .env file.
 *
 * Not compatible with Laravel because they use serialize()/unserialize()
 * @class
 */
class Encryption {
  private appKey: string        
  private algorithm: string

  constructor (Config: Config) {
    this.appKey = Config.get('app.appKey')
    this.algorithm = Config.get('app.encryption.algorithm', 'aes-256-cbc')

    if (!this.appKey) {
      throw RuntimeException.missingAppKey('App key needs to be specified in order to make use of Encryption', )
    }

    if (!this.supported(this.appKey, this.algorithm)) {
      throw RuntimeException.invalidEncryptionCipher()
    }
  }

  /**
   * Determine if the given key and cipher combination is valid.
   *
   * @param  {String}  key
   * @param  {String}  cipher
   * @return {Boolean}
   */
  supported (key: string, cipher:string): boolean {
    key = key || ''
    cipher = cipher || ''
    return (cipher.toLowerCase() === 'aes-128-cbc' && key.length === 16) || (cipher.toLowerCase() === 'aes-256-cbc' && key.length === 32)
  }

  /**
   * encrypts a given value
   *
   * @param  {Mixed} value - value to be encrypted
   * @param  {String} [encoding=utf8] encoding to be used for input value
   * @return {String}
   *
   * @example
   * Encryption.encrypt('somevalue')
   *
   * @public
   */
  encrypt (value: any, encoding: string): string {
    if (!value) {
      throw InvalidArgumentException.missingParameter('Could not encrypt the data')
    }

    encoding = encoding || 'utf8'
    let iv = crypto.randomBytes(this.getIvSize())

    const cipher = crypto.createCipheriv(this.algorithm, this.appKey, iv)
    value = cipher.update(value, encoding, 'base64')
    value += cipher.final('base64')

    // Once we have the encrypted value we will go ahead base64_encode the input
    // vector and create the MAC for the encrypted value so we can verify its
    // authenticity. Then, we'll JSON encode the data in a "payload" array.
    let new_iv: string = iv.toString()
    const mac = this.hash(new_iv = this.base64Encode(new_iv), value)
    const json = JSON.stringify({iv: new_iv, value: value, mac: mac})
    return this.base64Encode(json)
  }

  /**
   * decrypts encrypted value
   *
   * @param  {Mixed} value - value to decrypt
   * @param  {String} [encoding=utf8] encoding to be used for output value
   * @return {Mixed}
   *
   * @example
   * Encryption.decrypt('somevalue')
   *
   * @public
   */
  decrypt (payload: any, encoding:Utf8AsciiBinaryEncoding): any {
    encoding = encoding || 'utf8'
    payload = this.getJsonPayload(payload)
    
    const iv = this.base64Decode(payload.iv, true)

    const decipher = crypto.createDecipheriv(this.algorithm, this.appKey, iv)
    let decrypted = decipher.update(payload.value, 'base64', encoding)
    decrypted += decipher.final(encoding)

    if (!decrypted) {
      throw RuntimeException.decryptFailed()
    }
    return decrypted
  }

  /**
   * get the JSON object from the given payload
   *
   * @param  {String} payload
   * @return {Mixed}
   *
   * @public
   */
  getJsonPayload (payload: any): any {
    const json = this.base64Decode(payload)
    try {
      payload = JSON.parse(json)
    } catch (e) {
      throw RuntimeException.malformedJSON()
    }

    // If the payload is not valid JSON or does not have the proper keys set we will
    // assume it is invalid and bail out of the routine since we will not be able
    // to decrypt the given value. We'll also check the MAC for this encryption.
    if (!payload || this.invalidPayload(payload)) {
      throw RuntimeException.invalidEncryptionPayload()
    }

    if (!this.validMac(payload)) {
      throw RuntimeException.invalidEncryptionMac()
    }
    return payload
  }

  /**
   * Create a MAC for the given value
   *
   * @param  {String} iv
   * @param  {String} value
   * @return {String}
   *
   * @public
   */
  hash (iv: string, value: string) {
    return this.hashHmac('sha256', iv + value, this.appKey)
  }

  /**
   * Generate a keyed hash value using the HMAC method
   *
   * @param  {String} algo
   * @param  {String} data
   * @param  {String} key
   * @return {String}
   *
   * @public
   */
  hashHmac (algo: string, data: string, key: string): string {
    return crypto.createHmac(algo, key).update(data).digest('hex')
  }

  /**
   * returns encoded base64 string
   *
   * @param  {String} unencoded
   * @return {String}
   *
   * @public
   */
  base64Encode (unencoded: string): string {
    return new Buffer(unencoded || '').toString('base64')
  }

  /**
   * returns decoded base64 string/buffer
   *
   * @param  {String} encoded
   * @param  {Boolean} raw
   * @return {Mixed}
   *
   * @public
   */
  base64Decode (encoded: string, raw?: boolean): any {
    if (raw) {
      return new Buffer(encoded || '', 'base64')
    }
    return new Buffer(encoded || '', 'base64').toString('utf8')
  }

  /**
   * Verify that the encryption payload is valid.
   *
   * @param  {Mixed} data
   * @return {Boolean}
   *
   * @public
   */
  invalidPayload (data: any): boolean {
    return typeof data !== 'object' || !data.hasOwnProperty('iv') || !data.hasOwnProperty('value') || !data.hasOwnProperty('mac')
  }

  /**
   * Determine if the MAC for the given payload is valid
   *
   * @param  object payload
   * @return {Boolean}
   *
   * @public
   */
  validMac (payload: any): boolean {
    const bytes = crypto.randomBytes(this.getIvSize())

    let temp_bytes: string = bytes.toString()

    const calcMac = this.hashHmac('sha256', this.hash(payload.iv, payload.value), temp_bytes)
    return this.hashHmac('sha256', payload.mac, temp_bytes) === calcMac
  }

  /**
   * Get the IV size for the cipher
   *
   * @return {Integer}
   *
   * @public
   */
  getIvSize (): number {
    return 16
  }
}