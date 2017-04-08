# Radix Router

[![Build Status](https://travis-ci.org/charlieduong94/radix-router.svg?branch=master)](https://travis-ci.org/charlieduong94/radix-router)
[![Coverage Status](https://coveralls.io/repos/github/charlieduong94/radix-router/badge.svg?branch=master)](https://coveralls.io/github/charlieduong94/radix-router?branch=master)

A router implemented using a [Radix Tree](https://en.wikipedia.com/wiki/Radix_tree) (aka compact [Prefix Tree](https://en.wikipedia.com/wiki/Trie)).
This router has support for placeholders and wildcards.

### Installation
```
npm install --save radix-router
```
better yet
```
yarn add radix-router
```

### Usage

`new RadixRouter(options)` - Creates a new instance of a router. The `options` object is optional.

Possible parameters for the `options` object:

- `strict` - Setting this option to `true` will force lookups to match exact paths (trailing slashes will not be ignored). Defaults to `false`.

`insert(routeData)` - Adds the given path to the router and associates the given data with the path.

Example input:
```js
router.insert({
  path: '/my/path', // required
  // any additional data goes here
  extraData: 'anything can be added',
  handler: function (req, res) {
    // ...
  }
})
```


`lookup(path)` - Performs a lookup of the path. If there is a match, the data associated with the route is returned.

`delete(path)` - Deletes the path from the router.

`startsWith(prefix)` - Returns a map of all routes starting with the given prefix and the data associated with them.

### Example

```
const RadixRouter = require('radix-router');

let router = new RadixRouter({
    strict: true
});

router.insert({
  path: '/api/v1/route',
  much: 'data'
});

router.insert(
  path: '/api/v2/**',
  such: 'wildcard'
});

router.insert({
  path: '/api/v1/other-route/:id',
  so: 'placeholder',
  much: 'wow'
});

router.lookup('/api/v1/route');
// returns {
//   path: '/api/v1/route',
//   much: 'data'
// }

router.lookup('/api/v2/anything/goes/here');
// returns {
//   path: '/api/v2/**',
//   such: 'wildcard'
// }

router.lookup('/api/v1/other-route/abcd');
// returns {
//   path: '/api/v1/other-route/:id',
//   so: 'placeholder',
//   much: 'wow'
//   params: {
//     id: 'abcd'
//   }
// }

// remove route
router.delete('/api/v2/**');

router.lookup('/api/v2/anything/goes/here');
// returns null

route.startsWith('/api')
// returns [
//   {
//     path:'/api/v1/route',
//     much: 'data'
//   },
//   {
//     path: '/api/v1/other-route/:id',
//     so: 'placeholder',
//     much: 'wow'
//   }
// ]
```
