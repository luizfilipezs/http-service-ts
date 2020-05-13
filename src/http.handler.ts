/**
 * Allows `HttpHandler.request()` method to know what to request
 * and how to do it.
 */
interface RequestArgs<T> {
  url?: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  headers?: Headers;
  obj?: T;
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

/**
 * Define basic configuration for future requests, as headers
 * and a boolean that allow `request()` method to know if it is necessary
 * to append a slash in the end of the URL.
 */
interface HttpConfig {
  headers: Headers;
  /**
   * If `true` a slash will always be appended to the end of the URL (when there is no one).
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
   * Configure rules that will be aplied in every request.
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
   *
   * @return {Promise<T>} Promise of type T
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
    if (args.id) url += this.config.appendSlash ? `${args.id}/` : args.id.toString();

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
      method: args.method,
      headers: args.headers || this.config.headers,
      mode: args.noCors === true ? 'no-cors' : 'cors'
    };

    // Add body if there is one
    if (args.method !== 'get' && args.obj) requestInit.body = JSON.stringify(args.obj);

    // Request and parse response
    return await fetch(url, requestInit)
      .then((response) => this.parse<T>(response) as Promise<T>);
  }

  /**
   * @param {string} start First piece of URL (API root). E.g. `'https://api.example.com'`
   * @param {string} [final] Last piece of URL. E.g. `'users/12'`
   *
   * @return {string} URL with a slash between its first and last pieces or a slash at the end of the first.
   */
  private hasSlash = (start: string, end?: string) =>
    end ? start.endsWith('/') || end.startsWith('/') : start.endsWith('/');

  /**
   * @param {Response} response Response to turn into JSON, Text or Blob
   *
   * @return {Promise<T | string | null | Blob>} Promise with formatted content
   */
  private parse<T>(response: Response): Promise<T | string | null | Blob> {
    const contentType = response.headers.get('content-type');

    if (contentType === 'application/json')
      // JSON
      return response.json();

    if (contentType && contentType.startsWith('text'))
      // TEXT
      return response.text();

    if (!contentType)
      // NULL
      return new Promise((resolve) => resolve(null));

    // BLOB
    return response.blob();
  }
}