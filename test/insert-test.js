const expect = require('chai').expect
const RadixRouter = require('../index')
const _putRoute = require('./util/putRoute')

const WILDCARD_TYPE = 1
const PLACEHOLDER_TYPE = 2

describe('Router tree structure', function() {
  it('should be able to insert nodes correctly into the tree', function() {
    const router = new RadixRouter()
    _putRoute(router, 'hello')
    _putRoute(router, 'cool')
    _putRoute(router, 'hi')
    _putRoute(router, 'helium')
    _putRoute(router, '/choo')
    _putRoute(router, '//choo')

    const rootNode = router._rootNode
    const helloNode = rootNode.children.hello
    const coolNode = rootNode.children.cool
    const hiNode = rootNode.children.hi
    const heliumNode = rootNode.children.helium
    const slashNode = rootNode.children['']

    expect(helloNode).to.exist
    expect(coolNode).to.exist
    expect(hiNode).to.exist
    expect(heliumNode).to.exist
    expect(slashNode).to.exist

    const slashChooNode = slashNode.children.choo
    const slashSlashChooNode = slashNode.children[''].children.choo

    expect(slashChooNode).to.exist
    expect(slashSlashChooNode).to.exist
  })

  it('should insert static routes into the static route map', function() {
    const router = new RadixRouter()
    const route = '/api/v2/route'
    _putRoute(router, route)

    expect(router._staticRoutesMap[route]).to.exist
  })
  it('should not insert variable routes into the static route map', function() {
    const router = new RadixRouter()
    const routeA = '/api/v2/**'
    const routeB = '/api/v3/:placeholder'
    _putRoute(router, routeA)
    _putRoute(router, routeB)

    expect(router._staticRoutesMap[routeA]).to.not.exist
    expect(router._staticRoutesMap[routeB]).to.not.exist
  })

  it('should insert placeholder and wildcard nodes correctly into the tree', function() {
    const router = new RadixRouter()
    _putRoute(router, 'hello/:placeholder/tree')
    _putRoute(router, 'choot/choo/**')

    const helloNode = router._rootNode.children.hello
    const helloPlaceholderNode = helloNode.children[':placeholder']
    expect(helloPlaceholderNode.type).to.equal(PLACEHOLDER_TYPE)

    const chootNode = router._rootNode.children.choot
    const chootChooNode = chootNode.children.choo
    const chootChooWildcardNode = chootChooNode.children['**']
    expect(chootChooWildcardNode.type).to.equal(WILDCARD_TYPE)
  })

  it('should throw an error if a path is not supplied when inserting a route', function() {
    const router = new RadixRouter()
    const insert = router.insert.bind(router, {
      notAPath: 'this is not a path'
    })

    expect(insert).to.throw(/"path" must be provided/)
  })

  it('should be able to initialize routes via the router contructor', function() {
    const router = new RadixRouter({
      routes: [
        { path: '/api/v1', value: 1 },
        { path: '/api/v2', value: 2 },
        { path: '/api/v3', value: 3 }
      ]
    })

    const rootSlashNode = router._rootNode.children['']
    const apiNode = rootSlashNode.children.api
    const v1Node = apiNode.children.v1
    const v2Node = apiNode.children.v2
    const v3Node = apiNode.children.v3

    expect(v1Node).to.exist
    expect(v2Node).to.exist
    expect(v3Node).to.exist
    expect(v1Node.data.value).to.equal(1)
    expect(v2Node.data.value).to.equal(2)
    expect(v3Node.data.value).to.equal(3)
  })

  it('should throw an error if a path is not supplied when inserting a route via constructor', function() {
    function createRouter() {
      return new RadixRouter({
        routes: [{ path: '/api/v1' }, { notAPath: '/api/v2' }]
      })
    }

    expect(createRouter).to.throw(/"path" must be provided/)
  })

  it('should allow routes to be overwritten by performing another insert', function() {
    const router = new RadixRouter({
      routes: [{ path: '/api/v1', data: 1 }]
    })

    let apiRouteData = router.lookup('/api/v1')
    expect(apiRouteData.data).to.equal(1)

    router.insert({
      path: '/api/v1',
      data: 2,
      anotherField: 3
    })

    apiRouteData = router.lookup('/api/v1')
    expect(apiRouteData.data).to.equal(2)
    expect(apiRouteData.anotherField).to.equal(3)
  })
})
