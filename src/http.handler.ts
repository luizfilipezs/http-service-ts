// Informations about the request

interface RequestArgs<T> {
  url?: string;
  method: 'get' | 'post' | 'put' | 'delete';
  headers?: Headers;
  obj?: T;
  id?: number | string;
}

// Request configuration

interface HttpConfig {
  headers: Headers;
}

// HTTP requests handler

export class HttpHandler {
  config: HttpConfig;

  constructor(private root?: string) {
    this.config = {
      headers: new Headers(),
    };
  }

  /*
    You can provide a value for root property
    or simply pass one every time you access request() method.
  */

  async request<T>(args: RequestArgs<T>): Promise<T> {
    let url = '';

    if (this.root) url = this.root;
    if (args.url) url.concat(this.hasSlash(url, args.url) ? args.url : `/${args.url}`);
    if (args.id) url.concat(this.hasSlash(url) ? args.id.toString() : `/${args.id.toString()}`);

    const requestInit: RequestInit = {
      method: args.method,
      headers: args.headers || this.config.headers,
    };

    if (args.method !== 'get' && args.obj) requestInit.body = JSON.stringify(args.obj);

    return await fetch(url, requestInit).then(this.json);
  }

  // Avoids errors concatening the URLs

  private hasSlash = (start: string, final?: string) =>
    final ? start.endsWith('/') || final.startsWith('/') : start.endsWith('/');

  // Turn response to JSON

  private json = (response: Response) => (response.headers.has('Content-Type') ? response.json() : response);
}
