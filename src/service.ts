import { HttpHandler } from './http.handler';

// Service with the main HTTP protocols as methods, expecting a type (T) for the returns

export class Service<T> extends HttpHandler {
  constructor(apiRoot: string) {
    super(apiRoot);
  }

  get(): Promise<T | T[]> {
    return this.request<T | T[]>({ method: 'get' });
  }

  getById(id: number): Promise<T> {
    return this.request<T>({ method: 'get', id });
  }

  post(obj: T): Promise<T> {
    return this.request<T>({ method: 'post', obj });
  }

  put(obj: T, id: number): Promise<T> {
    return this.request<T>({ method: 'put', obj, id });
  }

  delete(id: number): Promise<{}> {
    return this.request<{}>({ method: 'delete', id });
  }
}
