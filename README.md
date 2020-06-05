# http-service-ts

## Installation

This package is available in [npm](https://www.npmjs.com/package/http-service-ts). Install it in your project with the following command:

```bash
npm i http-service-ts
```

### Import

CommonJS

```js
const { RequestParser, Service } = require('http-service-ts');
```

ES6

```ts
import { RequestParser, Service } from 'http-service-ts';
```

## How to use

### `RequestParser` class

Allows to make requests and get their responses formatted. Returns new promise with content as `JSON`, text (`string`), `Blob` or `null`.

Basic usage:

```ts
interface IP {
  ip: string;
}

const http = new RequestParser();

http.request<IP>({
  url: 'https://api6.ipify.org?format=json',
  method: 'get'
})
  .then(
    (response) => console.log(response.ip),
    (error) => console.error('Error! Server respond with: ', error)
  );
```

#### Headers

You can optionally provide headers in every request...

```ts
  ...
  method: 'get',
  headers: new Headers(),
  ...
```

...or use fixed headers for all requests:

```ts
http.config.headers.append('Authorization', token);
```

#### API root

You can provide a root in `constructor`. So when you give an url to request, it will be concatenated with the root. As follows:

```ts
const usersApi = new RequestParser('https://api.example.com');

const promise = usersApi.get<User>({
  url: 'users',
  method: 'get',
  id: 1
}); // Will fetch https://api.example.com/users/1
```

Note that you don't need to put a slash (/) before the URI. It's optional.

#### `config.appendSlash`

If server only supports requests with a `/` at the final of the URL, set `appendSlash` property to `true` in configurations:

```ts
const api = new RequestParser('https://api.example.com');
api.config.appendSlash = true;

api.request<User>({
  url: 'users',
  method: 'get',
  id: 1
}); // Will fetch https://api.example.com/users/1/
```

There is another way to set configurations for every request. You can pass them in constructor, as a second argument:

```ts
const api = new RequestParser('https://api.example.com', {
  headers: new Headers({
    Accept: 'application/json'
  }),
  appendSlash: true
});
```

#### Search params

Let's create our first example again with a different syntax. You can use search params:

```ts
const http = new RequestParser('https://api6.ipify.org');

http.request<IP>({
  method: 'get',
  params: {
    format: 'json'
  }
})
  .then(
    (response) => console.log(response.ip),
    (error) => console.error('Error! Server respond with: ', error)
  );

// fetch https://api6.ipify.org?format=json
```

### `Service` class

The methods provided in `Service` class are: `get()`, `getById()`, `post()`, `put()`, `patch()` and `delete()`. This class extends `RequestParser`, so `request()` method is available too.

You can use these methods for managing CRUD operations or write your own class extending `Service`. Example:

```ts
interface Product {
  id?: number;
  name: string;
  price: number;
}

class ProductService extends Service<Product> {
  
  constructor() {
    super('https://api.example.com/products');
  }
  
  getOffers() {
    // GET https://api.example.com/products/offers
    return this.request<Product[]>({ url: 'offers', method: 'get' })
  }
  
}
```
Using in a view:
```ts
class HomeView {
  
  products: Product[] = [];
  errorMessage: string;

  private productService = new ProductService();
  
  constructor() { }

  private setProducts(promise: Promise<Product[]>) {
    promise
      .then(
        (products) => this.products = products,
        (error) => this.errorMessage = 'There was an error trying to request products!'
      );
  } 
  
  getProducts() {
    this.setProducts(this.productService.get());
  }

  getOffers() {
    this.setProducts(this.productService.getOffers());
  }
  
  postProduct(product: Product) {
    this.productService.post(product)
      .then(
        (success) => this.getProducts(),
        (error) => this.errorMessage = 'There was an error trying to post product!'
      );
  }
  
}
```

## Prevent errors

When running this package on Node.js you can get an error because of `Headers` class.

This can be easily fixed with the following lines:

```js
const fetch = require('node-fetch');

global.fetch = fetch;
global.Headers = fetch.Headers;
```