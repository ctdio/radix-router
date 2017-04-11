var expect = require('chai').expect
var RadixRouter = require('../index')
var _putRoute = require('./util/putRoute')

function _getChild (node, prefix) {
  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].path === prefix) {
      return node.children[i]
    }
  }
  return null
}

var WILDCARD_TYPE = 1
var PLACEHOLDER_TYPE = 2

describe('Router tree structure', function () {
  it('should be able to insert nodes correctly into the tree', function () {
    var router = new RadixRouter()
    _putRoute(router, 'hello')
    _putRoute(router, 'cool')
    _putRoute(router, 'hi')
    _putRoute(router, 'helium')
    _putRoute(router, 'coooool')
    _putRoute(router, 'chrome')
    _putRoute(router, 'choot')
    _putRoute(router, '/choot')
    _putRoute(router, '//choot')
    /**
     * Expected structure:
     *            root
     *         /        \
     *        h             c
     *      /  \         /    \
     *     i   el       oo       h
     *       /   \     / \       /  \
     *      lo  ium  l  oool   rome  oot
     */

    var hNode = _getChild(router._rootNode, 'h')
    var iNode = _getChild(hNode, 'i')
    var elNode = _getChild(hNode, 'el')
    expect(hNode.children.length).to.equal(2)
    expect(iNode.path).to.not.equal(null)
    expect(elNode.children.length).to.equal(2)
    expect(_getChild(elNode, 'lo').path).to.not.equal(null)
    expect(_getChild(elNode, 'ium').path).to.not.equal(null)

    var cNode = _getChild(router._rootNode, 'c')
    var ooNode = _getChild(cNode, 'oo')
    var h2Node = _getChild(cNode, 'h')
    expect(ooNode.children.length).to.equal(2)
    expect(h2Node.children.length).to.equal(2)
    expect(_getChild(ooNode, 'l')).to.not.equal(null)
    expect(_getChild(ooNode, 'oool')).to.not.equal(null)

    expect(_getChild(h2Node, 'rome')).to.not.equal(null)
    expect(_getChild(h2Node, 'oot')).to.not.equal(null)
  })

  it('should insert placeholder and wildcard nodes correctly into the tree', function () {
    var router = new RadixRouter()
    _putRoute(router, 'hello/:placeholder/tree')
    _putRoute(router, 'choot/choo/**')

    var helloNode = _getChild(router._rootNode, 'hello')
    var helloSlashNode = _getChild(helloNode, '/')
    var helloSlashPlaceholderNode = _getChild(helloSlashNode, ':placeholder')
    expect(helloSlashPlaceholderNode.type).to.equal(PLACEHOLDER_TYPE)

    var chootNode = _getChild(router._rootNode, 'choot')
    var chootSlashNode = _getChild(chootNode, '/')
    var chootSlashChooNode = _getChild(chootSlashNode, 'choo')
    var chootSlashChooSlashNode = _getChild(chootSlashChooNode, '/')
    var chootSlashChooSlashWildcardNode = _getChild(chootSlashChooSlashNode, '**')
    expect(chootSlashChooSlashWildcardNode.type).to.equal(WILDCARD_TYPE)
  })

  it('should throw an error if a path is not supplied when inserting a route', function () {
    var router = new RadixRouter()
    var insert = router.insert.bind(router, {
      notAPath: 'this is not a path'
    })

    expect(insert).to.throw(/"path" must be provided/)
  })

  it('should be able to initialize routes via the router contructor', function () {
    var router = new RadixRouter({
      routes: [
        { path: '/api/v1', value: 1 },
        { path: '/api/v2', value: 2 },
        { path: '/api/v3', value: 3 }
      ]
    })

    var rootSlashNode = _getChild(router._rootNode, '/')
    var apiNode = _getChild(rootSlashNode, 'api')
    var apiSlashNode = _getChild(apiNode, '/')
    var vNode = _getChild(apiSlashNode, 'v')
    var v1Node = _getChild(vNode, '1')
    var v2Node = _getChild(vNode, '2')
    var v3Node = _getChild(vNode, '3')

    expect(v1Node).to.exist
    expect(v2Node).to.exist
    expect(v3Node).to.exist
    expect(v1Node.data.value).to.equal(1)
    expect(v2Node.data.value).to.equal(2)
    expect(v3Node.data.value).to.equal(3)
  })

  it('should throw an error if a path is not supplied when inserting a route via constructor', function () {
    function createRouter () {
      return new RadixRouter({
        routes: [
          { path: '/api/v1' },
          { notAPath: '/api/v2' }
        ]
      })
    }

    expect(createRouter).to.throw(/"path" must be provided/)
  })

  it('should allow routes to be overwritten by performing another insert', function () {
    var router = new RadixRouter({
      routes: [
        { path: '/api/v1', data: 1 }
      ]
    })

    var apiRouteData = router.lookup('/api/v1')
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

  context('upon removal of route', function () {
    it('should merge childNodes left with no siblings with parent if parent contains no data', function () {
      var router = new RadixRouter()
      router.insert({ path: 'thisIsA' })
      router.insert({ path: 'thisIsAnotherRoute', value: 1 })
      router.insert({ path: 'thisIsAboutToGetDeleted' })

      var baseNode = _getChild(router._rootNode, 'thisIsA')
      var anotherRouteNode = _getChild(baseNode, 'notherRoute')
      var aboutToGetDeletedNode = _getChild(baseNode, 'boutToGetDeleted')

      expect(anotherRouteNode).to.exist
      expect(aboutToGetDeletedNode).to.exist

      router.remove('thisIsAboutToGetDeleted')

      var newBaseNode = _getChild(router._rootNode, 'thisIsAnotherRoute')
      expect(newBaseNode).to.exist
      expect(newBaseNode.data.value).to.equal(1)
      expect(newBaseNode.data.path).to.equal('thisIsAnotherRoute')
    })

    it('should NOT merge childNodes left with no siblings with parent if contains data', function () {
      var router = new RadixRouter()
      router.insert({ path: 'thisIsA', data: 1 })
      router.insert({ path: 'thisIsAnotherRoute' })
      router.insert({ path: 'thisIsAboutToGetDeleted' })

      var baseNode = _getChild(router._rootNode, 'thisIsA')
      var anotherRouteNode = _getChild(baseNode, 'notherRoute')
      var aboutToGetDeletedNode = _getChild(baseNode, 'boutToGetDeleted')

      expect(anotherRouteNode).to.exist
      expect(aboutToGetDeletedNode).to.exist

      router.remove('thisIsAboutToGetDeleted')

      var newBaseNode = _getChild(router._rootNode, 'thisIsAnotherRoute')
      expect(newBaseNode).to.not.exist
      var originalBaseNode = _getChild(router._rootNode, 'thisIsA')
      expect(originalBaseNode).to.exist
      var originalAnotherRouteNode = _getChild(baseNode, 'notherRoute')
      expect(originalAnotherRouteNode).to.exist
    })

    it('should merge childNodes with parent if parent is a slash separator', function () {
      var router = new RadixRouter()
      router.insert({ path: 'thisIsA/', data: 1 })
      router.insert({ path: 'thisIsA/notherRoute' })
      router.insert({ path: 'thisIsA/boutToGetDeleted' })

      var baseNode = _getChild(router._rootNode, 'thisIsA')
      var slashNode = _getChild(baseNode, '/')
      var anotherRouteNode = _getChild(slashNode, 'notherRoute')
      var aboutToGetDeletedNode = _getChild(slashNode, 'boutToGetDeleted')

      expect(anotherRouteNode).to.exist
      expect(aboutToGetDeletedNode).to.exist

      router.remove('thisIsA/boutToGetDeleted')

      var originalBaseNode = _getChild(router._rootNode, 'thisIsA')
      expect(originalBaseNode).to.exist
      var originalAnotherRouteNode = _getChild(slashNode, 'notherRoute')
      expect(originalAnotherRouteNode).to.exist
    })
  })
})
