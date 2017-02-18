var expect = require('chai').expect

var RadixRouter = require('../index')

function getChild (node, prefix) {
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
    router.insert('hello')
    router.insert('cool')
    router.insert('hi')
    router.insert('helium')
    router.insert('coooool')
    router.insert('chrome')
    router.insert('choot')
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

    var hNode = getChild(router._rootNode, 'h')
    var iNode = getChild(hNode, 'i')
    var elNode = getChild(hNode, 'el')
    expect(hNode.children.length).to.equal(2)
    expect(iNode.path).to.not.equal(null)
    expect(elNode.children.length).to.equal(2)
    expect(getChild(elNode, 'lo').path).to.not.equal(null)
    expect(getChild(elNode, 'ium').path).to.not.equal(null)

    var cNode = getChild(router._rootNode, 'c')
    var ooNode = getChild(cNode, 'oo')
    var h2Node = getChild(cNode, 'h')
    expect(ooNode.children.length).to.equal(2)
    expect(h2Node.children.length).to.equal(2)
    expect(getChild(ooNode, 'l')).to.not.equal(null)
    expect(getChild(ooNode, 'oool')).to.not.equal(null)

    expect(getChild(h2Node, 'rome')).to.not.equal(null)
    expect(getChild(h2Node, 'oot')).to.not.equal(null)
  })

  it('insert placeholder and wildcard nodes correctly into the tree', function () {
    var router = new RadixRouter()
    router.insert('hello/:placeholder/tree')
    router.insert('choot/choo/**')

    var helloNode = getChild(router._rootNode, 'hello')
    var helloSlashNode = getChild(helloNode, '/')
    var helloSlashPlaceholderNode = getChild(helloSlashNode, ':placeholder')
    expect(helloSlashPlaceholderNode.type).to.equal(PLACEHOLDER_TYPE)

    var chootNode = getChild(router._rootNode, 'choot')
    var chootSlashNode = getChild(chootNode, '/')
    var chootSlashChooNode = getChild(chootSlashNode, 'choo')
    var chootSlashChooSlashNode = getChild(chootSlashChooNode, '/')
    var chootSlashChooSlashWildcardNode = getChild(chootSlashChooSlashNode, '**')
    expect(chootSlashChooSlashWildcardNode.type).to.equal(WILDCARD_TYPE)
  })
})
