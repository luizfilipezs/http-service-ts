import RequestParser from './request.parser';
import HttpConfig from './http.config';

/**
 * @class
 *
 * Customizable service that allow to perform main HTTP requests.
 * Extends `RequestParser` class. So it's possible to add more types of
 * request when extending this class.
 */
export default class Service<T> extends RequestParser {
  /**
   * @param {string} apiRoot Collection path (e.g. `"https://api.example.com/users/"`)
   */
  constructor(apiRoot: string, config?: HttpConfig) {
    super(apiRoot, config);
  }

  /**
   * @returns {Promise<T[]>} Promise with array of objets
   */
  get(): Promise<T[]> {
    return this.request<T[]>({ method: 'get' });
  }

  /**
   * @param {number} id Object ID to fetch
   * @returns {Promise<T>} A promise of object
   */
  getById(id: number): Promise<T> {
    return this.request<T>({ method: 'get', id });
  }

  /**
   * @param {T} obj Object to post
   * @returns {Promise<T>} Posted object
   */
  post(obj: T): Promise<T> {
    return this.request<T>({ method: 'post', obj });
  }

  /**
   * @param {T} obj Object to update
   * @param {number} id ID of object that will be updated
   * @returns {Promise<T>} Updated object
   */
  put(obj: T, id: number): Promise<T> {
    return this.request<T>({ method: 'put', obj, id });
  }

  /**
   * @param {Partial<T>} obj Object to update
   * @param {number} id ID of object that will be updated
   * @returns {Promise<Partial<T>>} Updated object part
   */
  patch(obj: Partial<T>, id: number): Promise<Partial<T>> {
    return this.request<Partial<T>>({ method: 'patch', obj, id });
  }

  /**
   * @param {number} id ID of object that will be deleted
   * @returns {Promise<null>} Null
   */
  delete(id: number): Promise<null> {
    return this.request<null>({ method: 'delete', id });
  }
}

/**
 * Partial object of generic type
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};
