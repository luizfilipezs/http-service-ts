/**
 * Allows `HttpHandler.request()` method to know what to request
 * and how to do it.
 */
interface RequestArgs<T> {
  url?: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  headers?: Headers;
  obj?: T;
  id?: number | string;
  cors?: boolean;
}

/**
 * Define basic configuration for future requests, as headers
 * and a boolean that allow `request()` method to know if it is necessary
 * to append a slash to the final of the URL.
 */
interface HttpConfig {
  headers: Headers;
  /**
   * If `true` a slash will always be appended to the end of the URL (when there is no one)
   */
  appendSlash: boolean;
}

/**
 * @class
 *
 * Allows to make requests and save some configurations for future
 * requests too. Accepts an API root at the constructor that can be used
 * to fix a URL to fetch. If one be provided every future request will
 * fetch this URL + the URL passed in `RequestArgs` interface.
 */
export class HttpHandler {
  /**
   *
   */
  public config: HttpConfig;

  /**
   * @param {string} [root] You can provide a value for root property
   * or simply pass one every time you access `request()` method.
   */
  constructor(private root?: string) {
    this.config = {
      headers: new Headers(),
      appendSlash: false,
    };
  }

  /**
   * @param {RequestArgs<T>} args Provide request configurations
   * @param {responseType} [format] Define a type for response (e.g. `'json'`)
   *
   * @return {Promise<T>} Promise of type T
   */
  public async request<T>(args: RequestArgs<T>): Promise<T> {
    let url = '';

    if (this.root) url = this.root; // Add root if there's one
    if (this.root && args.url) url += this.hasSlash(this.root, args.url) ? args.url : `/${args.url}`; // Concat root with URI if they were provided
    if (!this.root && args.url) url = args.url; // fetch URL provided in arguments

    if (this.config.appendSlash && !this.hasSlash(url)) url += '/';

    const requestInit: RequestInit = {
      method: args.method,
      headers: args.headers || this.config.headers,
      mode: args.cors === false ? 'no-cors' : 'cors',
    };
    if (args.method !== 'get' && args.obj) requestInit.body = JSON.stringify(args.obj);

    return await fetch(url, requestInit).then((response) => this.parse<T>(response) as Promise<T>);
  }

  /**
   * @param {string} start First piece of URL (API root). E.g. `'https://api.example.com'`
   * @param {string} [final] Last piece of URL. E.g. `'users/12'`
   *
   * @return {string} URL with a slash between its first and last pieces or a slash at the final of the first.
   */
  private hasSlash = (start: string, final?: string) =>
    final ? start.endsWith('/') || final.startsWith('/') : start.endsWith('/');

  /**
   * @param {Response} response Get a response to turn into JSON, Text or Blob
   * @param {responseType} [format] Get the Content-Type that must be returned
   *
   * @return {Promise<T | string | object | Blob>} New promise with the content type defined in `format` param
   */
  private parse<T>(response: Response): Promise<T | string | object | Blob> {
    const contentType = response.headers.get('content-type');

    if (contentType === 'application/json')
      // JSON
      return response.json();

    if (contentType && contentType.startsWith('text'))
      // TEXT
      return response.text();

    if (!contentType)
      // EMPTY OBJECT
      return new Promise((resolve, reject?) => resolve({}));

    // BLOB
    return response.blob();
  }

  /**
   * @param {Promise<T>[]} promises Promises to be resolved together
   *
   * @return {Promise<T>[]} Array of promises
   */
  public async join<T>(...promises: Promise<T>[]) {
    return await Promise.all(promises);
  }
}
