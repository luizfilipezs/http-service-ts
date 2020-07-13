import RequestArgs from './request.args';
import HttpConfig from './http.config';

/**
 * @class
 *
 * Allows to make requests and save some configurations for future
 * requests too. Accepts an API root at the constructor that can be used
 * to fix an URL to fetch. If one be provided, every future request will
 * fetch this URL + the URL passed in `RequestArgs` interface.
 */
export default class RequestParser {
  /**
   * Configure rules that will be aplied in every request.
   */
  public config: HttpConfig;

  /**
   * @param {string} [root] You can provide a value for root property
   * or simply pass one every time you access `request()` method.
   * @param {HttpConfig} [config] Configurations that will be aplied
   * in every request.
   */
  constructor(private root?: string, config?: HttpConfig) {
    this.config = config || {
      headers: new Headers(),
      appendSlash: false,
    };
  }

  /**
   * @param {RequestArgs<T>} args Provide request configurations
   *
   * @returns {Promise<T>} Promise with parsed content
   */
  public async request<T>(args: RequestArgs<T>): Promise<T> {
    let url = '';

    // Add root if there's one
    if (this.root) url = this.root;

    // Concat root with URI if they were provided
    if (this.root && args.url) url += this.hasSlash(this.root, args.url) ? args.url : `/${args.url}`;

    // fetch URL provided in arguments
    if (!this.root && args.url) url = args.url;

    // add a slash
    if (this.config.appendSlash && !this.hasSlash(url)) url += '/';

    // add ID
    if (args.id) url += this.config.appendSlash ? args.id + '/' : args.id.toString();

    // Append search params to the end of URL
    if (args.params) {
      // Remove last slash and add a "?"
      if (url.endsWith('/')) url = url.substring(0, url.length - 1);

      url += '?';

      // Add params and remove last "&"
      for (const key in args.params) url += `${key}=${args.params[key]}&`;

      url = url.substring(0, url.length - 1);
    }

    // Configure request
    const requestInit: RequestInit = {
      method: args.method.toUpperCase(),
      headers: args.headers || this.config.headers,
      mode: args.noCors === true ? 'no-cors' : 'cors',
    };

    // Add body if there is one
    if (args.method !== 'get' && args.obj) requestInit.body = JSON.stringify(args.obj);

    // Request
    const req = await fetch(url, requestInit);

    // Return promise with parsed content from response
    return this.parse<T>(req) as Promise<T>;
  }

  /**
   * @param {string} start First piece of URL (API root). E.g. `'https://api.example.com'`
   * @param {string} [final] Last piece of URL. E.g. `'users/12'`
   *
   * @returns {string} URL with a slash between its first and last pieces or a slash at the end of the first.
   */
  private hasSlash = (start: string, end?: string) =>
    end ? start.endsWith('/') || end.startsWith('/') : start.endsWith('/');

  /**
   * @param {Response} response Response to turn into JSON, Text or Blob
   *
   * @returns {Promise<T | string | null | Blob>} Promise with formatted content
   */
  private async parse<T>(response: Response): Promise<T | string | null | Blob> {
    let p: T | string | null | Blob;
    const contentType = response.headers.get('content-type');

    if (contentType === 'application/json')
      // Object
      p = await response.json();
    else if (contentType && contentType.startsWith('text'))
      // Text
      p = await response.text();
    else if (!contentType)
      // Null
      p = null;
    // Blob
    else p = await response.blob();

    return new Promise((resolve, reject) => (response.status >= 200 && response.status < 300 ? resolve(p) : reject(p)));
  }
}
