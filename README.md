# Radix Router

[![Greenkeeper badge](https://badges.greenkeeper.io/charlieduong94/radix-router.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/charlieduong94/radix-router.svg?branch=master)](https://travis-ci.org/charlieduong94/radix-router)
[![Coverage Status](https://coveralls.io/repos/github/charlieduong94/radix-router/badge.svg?branch=master)](https://coveralls.io/github/charlieduong94/radix-router?branch=master)

A fast, simple path router that is optimized for consistently fast lookups. This router
has support for placeholders and wildcards.

### Installation
```bash
npm install --save radix-router
```

### Usage

A minimal example:

```js
const RadixRouter = require('radix-router')

const router = new Router()
router.insert({
  path: '/api/people/:id',
  data: { some: 'data' }
})

const { data, params } = router.lookup('/api/people/123456')

const { id } = params
console.log(id) // prints: '123456'
console.log(data) // prints: { some: 'data' }
```

#### Creating a new Router

`new RadixRouter(options)` - Creates a new instance of a router. The `options` object is optional.

Possible parameters for the `options` object:

- `routes` - The routes to insert into the router.
- `strict` - Setting this option to `true` will force lookups to match exact paths
(trailing slashes will not be ignored). Defaults to `false`.

```js
const RadixRouter = require('radix-router')

const router = new RadixRouter({
  strict: true,
  routes: [
    {
      path: '/my/api/route/a', // "path" is a required field
      // any other fields will also be stored by the router
      extraRouteData: {},
      description: 'this is a route'
    },
    {
      path: '/my/api/route/b',
      extraRouteData: {},
      description: 'this is a different route',
      routeBSpecificData: {}
    }
  ]
})
```

#### Router methods

##### `insert(routeData)`

Adds the given data to the router. The object passed in must contain a `path` attribute that is a string.
The `path` will be used by the router to know where to place the route.

Example input:
```js
router.insert({
  path: '/api/route/c', // required
  // any additional data goes here
  extraData: 'anything can be added',
  handler: function (req, res) {
    // ...
  }
})
```

##### `lookup(path)`

Performs a lookup of the path. If there is a match, the data associated with the
route is returned, otherwise this will return `null`.

Usage:

```js
const routeThatExists = router.lookup('/api/route/c')
```

Example output:

```js
{
  path: '/api/route/c',
  extraData: 'anything can be added',
  handler: function (req, res) {
    // ...
  }
}
```

##### `remove(path)`

Removes the path from the router. Returns `true` if the route was found and removed.

Usage:

```
const routeRemoved = router.remove('/some/route')
```

##### `startsWith(path)`

Returns a map of all routes starting with the given prefix and the data associated with them.

Usage:

```
const apiRoutes = router.startsWith('/api')
```

Example output:

```js
[
  {
    path:'/api/v1/route',
    much: 'data'
  },
  {
    path: '/api/v1/other-route/:id',
    so: 'placeholder',
    much: 'wow'
  }
]
```

### Wildcard and placeholder matching

Wildcards can be added by to the end of routes by adding `/**` to the end of your route.

Example:

```js
router.insert(
  path: '/api/v2/**',
  such: 'wildcard'
})
```

Output of `router.lookup('/api/v2/some/random/route')`:
```js
{
  path: '/api/v2/**',
  sucn: 'wildcard'
}
```

Placeholders can be used in routes by starting a segment of the route with a colon `:`. Whatever
content fills the position of the placeholder will be added to the lookup result
under the `params` attribute. The name given for the placeholder in the path is the key to
retrieve the parameter from.

Example:

```js
router.insert(
  path: '/api/v2/:myPlaceholder/route'
})

router.insert(
  path: '/api/v3/:organizations/directory/:groupId'
})
```

Output of `router.lookup('/api/v2/application/route')`:
```js
{
  path: '/api/v2/:myPlaceholder/route',
  params: {
    myPlaceholder: 'application'
  }
}
```

Output of `router.lookup('/api/v3/test-org/directory/test-group-id')`:
```js
{
  path: '/api/v3/:organizations/directory/:groupId',
  params: {
    organizations: 'test-org',
    groupId: 'test-group-id'
  }
}
```
