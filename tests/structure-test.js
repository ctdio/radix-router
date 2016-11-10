const {expect} = require('chai');

let RadixRouter = require('../index');

function getChild(node, prefix) {
    for (var i = 0; i < node.children.length; i++) {
        if (node.children[i].path === prefix) {
            return node.children[i];
        }
    }
    return null;
}

const WILDCARD_TYPE = 1;
const PLACEHOLDER_TYPE = 2;

describe('Router tree structure', () => {
    it('should be able to insert nodes correctly into the tree', () => {
        let router = new RadixRouter();
        router.insert('hello');
        router.insert('cool');
        router.insert('hi');
        router.insert('helium');
        router.insert('coooool');
        router.insert('chrome');
        router.insert('choot');
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

        let h_node = getChild(router._rootNode, 'h');
        let i_node = getChild(h_node, 'i');
        let el_node = getChild(h_node, 'el');
        expect(h_node.children.length).to.equal(2);
        expect(i_node.path).to.not.equal(null);
        expect(el_node.children.length).to.equal(2);
        expect(getChild(el_node, 'lo').path).to.not.equal(null);
        expect(getChild(el_node, 'ium').path).to.not.equal(null);

        let c_node = getChild(router._rootNode, 'c');
        let oo_node = getChild(c_node, 'oo');
        let h2_node = getChild(c_node, 'h');
        expect(oo_node.children.length).to.equal(2);
        expect(h2_node.children.length).to.equal(2);
        expect(getChild(oo_node, 'l')).to.not.equal(null);
        expect(getChild(oo_node, 'oool')).to.not.equal(null);

        expect(getChild(h2_node, 'rome')).to.not.equal(null);
        expect(getChild(h2_node, 'oot')).to.not.equal(null);
    });

    it('insert placeholder and wildcard nodes correctly into the tree', () => {
        let router = new RadixRouter();
        router.insert('hello/:placeholder/tree');
        router.insert('choot/choo/**');

        let hello_node = getChild(router._rootNode, 'hello');
        let hello_slash_node = getChild(hello_node, '/');
        let hello_slash_placeholder_node = getChild(hello_slash_node, ':placeholder');
        expect(hello_slash_placeholder_node.type).to.equal(PLACEHOLDER_TYPE);

        let choot_node = getChild(router._rootNode, 'choot');
        let choot_slash_node = getChild(choot_node, '/');
        let choot_slash_choo_node = getChild(choot_slash_node, 'choo');
        let choot_slash_choo_slash_node = getChild(choot_slash_choo_node, '/');
        let choot_slash_choo_slash_wildcard_node = getChild(choot_slash_choo_slash_node, '**');
        expect(choot_slash_choo_slash_wildcard_node.type).to.equal(WILDCARD_TYPE);
    });
});
