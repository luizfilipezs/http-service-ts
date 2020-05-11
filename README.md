# http-service-ts

## Installation

This package is available in [npm](https://www.npmjs.com/package/http-service-ts). Install it inside your project with the following command:

`npm i http-service-ts`

## How to use

### `HttpHandler` class

Basic usage:

```

interface IP {
  ip: string;
}

const http = new HttpHandler();

http.request<IP>({
  url: 'https://api6.ipify.org?format=json',
  method: 'get'
})
.then(
  (response) => console.log(response.ip),
  (error) => console.error(`There was an error: ${error}`)
);

```

You can optionally provide headers in every request...

```
  ...
  method: 'get',
  headers: new Headers(),
  ...
```

...or use fixed headers for all requests:

```
http.config.headers.append('Authorization', token);
```

You can provide a root in `constructor`. So when you give an url to request, it will be concatenated with the root. As follows:

```
const usersApi = new HttpHandler('https://api.example.com');

const promise = usersApi.get<User>({
  url: 'users',
  method: 'get',
  id: 1
}); // Will fetch https://api.example.com/users/1

```

Note that you don't need to put a slash (/) before the URI. It's optional.

If server only supports requests with a `l` at the final of the URL, set `appendSlash` property `true`:

```
const api = new HttpHandler('https://api.example.com');

api.config.appendSlash = true;

api.request<User>({ url: 'users', id: 1 }); // Will fetch https://api.example.com/users/1/
```

### `Service` class

You can use the basic methods in `Service` for managing CRUD operations or make your own class extending `Service`. Example:

```

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

class HomeView {
  
  products: Product[];
  errorMessage: string;
  
  constructor(private productService: ProductService) { }
  
  getProducts() {
    this.productService.get()
      .then(
        (products: Product[]) => this.products = products,
        (error) => this.errorMessage = error
      );
  }
  
  postProduct(obj: Product) {
    this.productService.post(obj)
      .then(console.log, console.error);
  }
}

```