let {expect} = require('chai');
let RadixTree = require('../index');

describe('Radix Tree', () => {
    it('should be able to insert nodes correctly into the tree', () => {
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

    it('should be able to perform a lookup properly', () => {
        let tree = new RadixTree();
        tree.insert('hello', 1);
        tree.insert('cool', 2);
        tree.insert('hi', 3);
        tree.insert('helium', 4);
        tree.insert('coooool', 5);
        tree.insert('chrome', 6);
        tree.insert('choot', 7);
        
        expect(tree.lookup('hello')).to.equal(1);
        expect(tree.lookup('cool')).to.equal(2);
        expect(tree.lookup('hi')).to.equal(3);
        expect(tree.lookup('helium')).to.equal(4);
        expect(tree.lookup('coooool')).to.equal(5);
        expect(tree.lookup('chrome')).to.equal(6);
        expect(tree.lookup('choot')).to.equal(7);
    });

    it('should be able to delete nodes', () => {
        let tree = new RadixTree();
        tree.insert('hello', 1);
        tree.insert('cool', 2);
        tree.insert('hi', 3);
        tree.insert('helium', 4);
        tree.insert('coooool', 5);
        tree.insert('chrome', 6);
        tree.insert('choot', 7);
        
        tree.delete('choot');
        expect(tree.lookup('choot')).to.equal(null);
    });

    it('should be able retrieve data via prefix', () => {
        let tree = new RadixTree();
        tree.insert('hello', 1);
        tree.insert('cool', 2);
        tree.insert('hi', 3);
        tree.insert('helium', 4);
        tree.insert('coooool', 5);
        tree.insert('chrome', 6);
        tree.insert('choot', 7);
        // TODO: complete
        
    });
});
