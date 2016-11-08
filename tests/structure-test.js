const {expect} = require('chai');

let RadixTree = require('../index');

describe('Router tree structure', () => {
    // TODO: Redo this portion to show valid structure
    it.skip('should be able to insert nodes correctly into the tree', () => {
        let tree = new RadixTree();
        tree.insert('hello');
        tree.insert('cool');
        tree.insert('hi');
        tree.insert('helium');
        tree.insert('coooool');
        tree.insert('chrome');
        tree.insert('choot');
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

        let h_node = tree._rootNode.children['h'];
        let el_node = h_node.children['el'];
        expect(h_node.children['i']).to.not.equal(undefined);
        expect(el_node.children['lo']).to.not.equal(undefined);
        expect(el_node.children['ium']).to.not.equal(undefined);

        let c_node = tree._rootNode.children['c'];
        let oo_node = c_node.children['oo'];
        let h2_node = c_node.children['h'];
        expect(oo_node.children['l']).to.not.equal(undefined);
        expect(oo_node.children['oool']).to.not.equal(undefined);
        expect(h2_node.children['rome']).to.not.equal(undefined);
        expect(h2_node.children['oot']).to.not.equal(undefined);

    });
});
