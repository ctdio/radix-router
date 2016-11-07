# Radix Router


A simple router implemented using a [Radix Tree](https://en.wikipedia.com/wiki/Radix_tree) (aka compact [Prefix Tree](https://en.wikipedia.com/wiki/Trie)).

### Installation
```
npm install --save radix-router
```
better yet
```
yarn add radix-router
```

### Usage

`insert(path, data)` - adds the given path to the router and associates the given data with the path

`lookup(path)` - performs a lookup of the path. If there is a match, the data associated with the route is returned

`delete(path)` - deletes the path from the router

`startsWith(prefix)` - returns a map of all routes starting with the given prefix and the data associated with them

### Example

```
const RadixRouter = require('radix-router');

let router = new RadixRouter();

router.insert('/api/v1/route', {
    much: 'data'
});

router.insert('/api/v2/**', {
    such: 'wildcard'
});

router.insert('/api/v1/other-route/:id', {
    so: 'placeholder',
    much: 'wow'
});

router.lookup('/api/v1/route');
// returns {
//     path: '/api/v1/route',
//     data: {
//         much: 'data'
//     }
// }

router.lookup('/api/v2/anything/goes/here');
// returns {
//     path: '/api/v2/cool',
//     data: {
//         such: 'wildcard'
//     }
// }

router.lookup('/api/v1/other-route/abcd');
// returns {
//     path: '/api/v1/other-route/abcd',
//     data: {
//         so: 'placeholder',
//         much: 'wow'
//     },
//     params: {
//         id: 'abcd'
//     }
// }

// remove route
router.delete('/api/v2/**');

router.lookup('/api/v2/anything/goes/here');
// returns {
//     path: '/api/v2/cool',
//     data: null
// }

route.startsWith('/api')
// returns {
//     '/api/v1/route': {
//         much: 'data'
//     },
//     '/api/v1/other-route/:id': {
//         so: 'placeholder',
//         much: 'wow'
//     }
// }
```
