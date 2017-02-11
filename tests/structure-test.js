const {expect} = require('chai')

let RadixRouter = require('../index')

function getChild (node, prefix) {
  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].path === prefix) {
      return node.children[i]
    }
  }
  return null
}

const WILDCARD_TYPE = 1
const PLACEHOLDER_TYPE = 2

describe('Router tree structure', () => {
  it('should be able to insert nodes correctly into the tree', () => {
    let router = new RadixRouter()
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

    let hNode = getChild(router._rootNode, 'h')
    let iNode = getChild(hNode, 'i')
    let elNode = getChild(hNode, 'el')
    expect(hNode.children.length).to.equal(2)
    expect(iNode.path).to.not.equal(null)
    expect(elNode.children.length).to.equal(2)
    expect(getChild(elNode, 'lo').path).to.not.equal(null)
    expect(getChild(elNode, 'ium').path).to.not.equal(null)

    let cNode = getChild(router._rootNode, 'c')
    let ooNode = getChild(cNode, 'oo')
    let h2Node = getChild(cNode, 'h')
    expect(ooNode.children.length).to.equal(2)
    expect(h2Node.children.length).to.equal(2)
    expect(getChild(ooNode, 'l')).to.not.equal(null)
    expect(getChild(ooNode, 'oool')).to.not.equal(null)

    expect(getChild(h2Node, 'rome')).to.not.equal(null)
    expect(getChild(h2Node, 'oot')).to.not.equal(null)
  })

  it('insert placeholder and wildcard nodes correctly into the tree', () => {
    let router = new RadixRouter()
    router.insert('hello/:placeholder/tree')
    router.insert('choot/choo/**')

    let helloNode = getChild(router._rootNode, 'hello')
    let helloSlashNode = getChild(helloNode, '/')
    let helloSlashPlaceholderNode = getChild(helloSlashNode, ':placeholder')
    expect(helloSlashPlaceholderNode.type).to.equal(PLACEHOLDER_TYPE)

    let chootNode = getChild(router._rootNode, 'choot')
    let chootSlashNode = getChild(chootNode, '/')
    let chootSlashChooNode = getChild(chootSlashNode, 'choo')
    let chootSlashChooSlashNode = getChild(chootSlashChooNode, '/')
    let chootSlashChooSlashWildcardNode = getChild(chootSlashChooSlashNode, '**')
    expect(chootSlashChooSlashWildcardNode.type).to.equal(WILDCARD_TYPE)
  })
})
