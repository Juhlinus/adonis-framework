/**
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
import * as path from 'path'
import { fs } from 'co-fs-extra'
import * as bytes from 'bytes'
import { RuntimeException, InvalidArgumentException, HttpException }  from '../Exceptions'

/**
 * Used by request object internally to manage file uploads.
 *
 * @class
 *
 * @alias Request.file
 */
export class File {
  private options: Object
  private _deleted: boolean
  private _error: any
  private _fileName: string
  private _maxSize: string
  private _allowedExtensions: Array<string>
  private _filePath: string
  private _file: Object
  private _name: string
  private _type: string
  private _size: string
  private _path: string

  constructor (formidableObject: Object, options: any) {
    this.options = options || {}
    this.file = formidableObject
    // this.file.deleted = false
    this.deleted = false
    this.error = null
    this.fileName = ''
    this.maxSize = options.maxSize ? bytes(options.maxSize) : null
    this.allowedExtensions = options.allowedExtensions || []
    this.filePath = ''
  }

  /**
   * sets error on the file instance and clears
   * the file name and path
   *
   * @param   {String} error
   *
   * @private
   */
  _setError (error) {
    this.error = error
    this.fileName = ''
    this.filePath = ''
  }

  /**
   * sets filePath and name after the move
   * and clears the error.
   *
   * @param   {String} fileName
   * @param   {String} filePath
   *
   * @private
   */
  _setUploadedFile (fileName, filePath) {
    this.error = null
    this.fileName = fileName
    this.filePath = filePath
  }

  /**
   * sets file size exceeds error
   *
   * @private
   */
  _setFileSizeExceedsError () {
    this._setError(`Uploaded file size ${bytes(this.clientSize())} exceeds the limit of ${bytes(this.maxSize)}`)
  }

  /**
   * sets file size extension error
   *
   * @private
   */
  _setFileExtensionError () {
    this._setError(`Uploaded file extension ${this.extension()} is not valid`)
  }

  /**
   * validates the file size
   *
   * @return  {Boolean}
   *
   * @private
   */
  _underAllowedSize () {
    return !this.maxSize || (this.clientSize() <= this.maxSize)
  }

  /**
   * returns whether file has one of the defined extension
   * or not.
   *
   * @return  {Boolean} [description]
   *
   * @private
   */
  _hasValidExtension () {
    return !this.allowedExtensions.length || this.allowedExtensions.indexOf(this.extension()) > -1
  }

  /**
   * a method to validate a given file.
   *
   * @return {Boolean}
   */
  validate () {
    if (!this._hasValidExtension()) {
      this._setFileExtensionError()
      return false
    } else if (!this._underAllowedSize()) {
      this._setFileSizeExceedsError()
      return false
    }
    return true
  }

  /**
   * validates the file size and move it to the destination
   *
   * @param   {String} fileName
   * @param   {String} completePath
   *
   * @private
   */
  * _validateAndMove (fileName, completePath) {
    if (!this.validate()) {
      return
    }
    try {
      yield fs.move(this.tmpPath(), completePath)
      this._setUploadedFile(fileName, completePath)
    } catch (error) {
      this._setError(error)
    }
  }

  /**
   * moves uploaded file from tmpPath to a given location. This is
   * an async function.
   *
   * @param  {String} toPath
   * @param  {String} name
   *
   * @example
   * yield file.move()
   *
   * @public
   */
  move (toPath, name) {
    if (this.deleted === true) {
      throw RuntimeException.fileDeleted()
    }
    name = name || this.clientName()
    const uploadingFileName = `${toPath}/${name}`
    return this._validateAndMove(name, uploadingFileName)
  }

  /**
   * Deletes a file
   *
   * @return {Boolean}
   *
   * @example
   * yield file.delete()
   *
   * @public
   */
  delete () {
    return new Promise((resolve, reject) => {
      if (this.deleted === true) {
        throw RuntimeException.fileDeleted()
      }
      let path = this.uploadPath() || this.tmpPath()
      fs.unlink(path, (err) => {
        if (err) return reject(err)
        resolve(true)
        this.deleted = true
      })
    })
  }

  /**
   * returns name of the uploaded file inside tmpPath.
   *
   * @return {String}
   *
   * @public
   */
  clientName () {
    return this.name ? this.name : this.fileName
  }

  /**
   * returns file mime type detected from original uploaded file.
   *
   * @return {String}
   *
   * @public
   */
  mimeType () {
    return this.type
  }

  /**
   * returns file extension from original uploaded file.
   *
   * @return {String}
   *
   * @public
   */
  extension () {
    return path.extname(this.clientName()).replace('.', '')
  }

  /**
   * returns file size of original uploaded file.
   *
   * @return {String}
   *
   * @public
   */
  clientSize () {
    return this.size
  }

  /**
   * returns temporary path of file.
   *
   * @return {String}
   *
   * @public
   */
  tmpPath () {
    return this.path
  }

  /**
   * returns file name after moving file
   *
   * @return {String}
   *
   * @public
   */
  uploadName () {
    return this.fileName
  }

  /**
   * returns complete uploadPath after moving file
   *
   * @return {String}
   *
   * @public
   */
  uploadPath () {
    return this.filePath
  }

  /**
   * tells whether file exists on temporary path or not
   *
   * @return {Boolean}
   *
   * @public
   */
  exists () {
    return this.tmpPath() && !this.deleted
  }

  /**
   * tells whether move operation was successful or not
   *
   * @return {Boolean}
   *
   * @public
   */
  moved () {
    return !this.errors()
  }

  /**
   * returns errors caused while moving file
   *
   * @return {Object}
   *
   * @public
   */
  errors () {
    return this.error
  }

  /**
   * returns the JSON representation of the
   * file instan
   *
   * @return {Object}
   *
   * @public
   */
  toJSON () {
    return this.file
  }

  get deleted(): boolean { return this._deleted }
  set deleted(value: boolean) { this._deleted = value }

  get error(): any { return this._error }
  set error(value: any) { this._error = value }

  get fileName(): string { return this._fileName }
  set fileName(value: string) { this._fileName = value }

  get maxSize(): string { return this._maxSize }
  set maxSize(value: string) { this._maxSize = value }

  get allowedExtensions(): string[] { return this._allowedExtensions }
  set allowedExtensions(value: string[]) { this._allowedExtensions = value }

  get filePath(): string { return this._filePath }
  set filePath(value: string) { this._filePath = value }

  get name(): string { return this._name }
  set name(value: string) { this._name = value }

  get type(): string { return this._type }
  set type(value: string) { this._type = value }

  get size(): string { return this._size }
  set size(value: string) { this._size = value }

  get path(): string { return this._path }
  set path(value: string) { this._path = value }

  get file(): Object { return { deleted: this.deleted, error: this.error, fileName: this.fileName, 
                                maxSize: this.maxSize, allowedExtensions: this.allowedExtensions,
                                filePath: this.filePath } }
  set file(value: Object) { this._file = value }
}