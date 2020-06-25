/**
 * Allows `RequestParser.request()` method to know what to request
 * and how to do it.
 */
export default interface RequestArgs<T> {
  /**
   * Full URL or last piece of it, if a root was provided
   * in the constructor of `RequestParser` class
   */
  url?: string;
  /**
   * One of the main HTTP methods for managing objects in a table
   */
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  /**
   * Define headers for current request, ignoring fixed headers
   * defined in `RequestParser.config.headers`
   */
  headers?: Headers;
  /**
   * Request body
   */
  obj?: T;
  /**
   * ID of object (type `T`) in database collection
   */
  id?: number;
  /**
   * Define request mode. `true` sets to `'no-cors'`.
   * If `null` request mode will be `'cors'`.
   */
  noCors?: true;
  /**
   * Object with search params (e.g. `{ q: 'code' }`)
   */
  params?: { [key: string]: string };
}
