import { HttpHandler } from './http.handler';

/**
 * @class
 *
 * Customizable service that allow to perform main HTTP requests.
 * Extends `HttpHandler` class. So it's possible to add more types of
 * request when extending this class.
 */
export class Service<T> extends HttpHandler {
  /**
   * @param {string} [apiRoot] Get the path of a collection (e.g. `"https://api.example.com/users/"`)
   */
  constructor(apiRoot: string) {
    super(apiRoot);
  }

  /**
   * @return {Promise<T | T[]>} An object promise or array of objects promise
   */
  get(): Promise<T | T[]> {
    return this.request<T | T[]>({ method: 'get' });
  }

  /**
   * @param {number} [id] Object ID to fetch
   * @return {Promise<T>} A promise of object
   */
  getById(id: number): Promise<T> {
    return this.request<T>({ method: 'get', id });
  }

  /**
   * @param {T} [obj] Object to post
   * @return {Promise<T>} Object posted
   */
  post(obj: T): Promise<T> {
    return this.request<T>({ method: 'post', obj });
  }

  /**
   * @param {T} [obj] Object to update
   * @param {number} [id] ID of object that will be updated
   * @return {Promise<T>} Object updated
   */
  put(obj: T, id: number): Promise<T> {
    return this.request<T>({ method: 'put', obj, id });
  }

  /**
   * @param {number} [id] ID of object that will be deleted
   * @return {Promise<{}>} Empty object
   */
  delete(id: number): Promise<{}> {
    return this.request<{}>({ method: 'delete', id });
  }
}
