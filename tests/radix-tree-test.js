const {expect} = require('chai');
const util = require('util');

let RadixTree = require('../index');

describe('Radix Tree', () => {
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

    it('should be able to perform a lookup properly', () => {
        let tree = new RadixTree();
        tree.insert('hello', 1);
        tree.insert('cool', 2);
        tree.insert('hi', 3);
        tree.insert('heli//u/m', 4);
        tree.insert('coooool', 5);
        tree.insert('chrome', 6);
        tree.insert('choot', 7);
        tree.insert('chrome/coooo/il/li/iloool', 9)
        tree.insert('//chrome//coooo/il/li/iloool', 10)
        tree.insert('/chrome//coooo/il/li/iloool', 11)
        tree.insert('chrome/**', 12);
        tree.insert('chrome/*/coooo/il/li/iloool', 13);
        tree.insert('carbon/:element', 14);
        tree.insert('carbon/:element/test/:testing', 15);
        tree.insert('this/:route/has/:cool/stuff/**', 16);

        expect(tree.lookup('hello')).to.deep.equal({data: 1});
        expect(tree.lookup('cool')).to.deep.equal({data: 2});
        expect(tree.lookup('hi')).to.deep.equal({data: 3});
        expect(tree.lookup('heli//u/m')).to.deep.equal({data: 4});
        expect(tree.lookup('coooool')).to.deep.equal({data: 5});
        expect(tree.lookup('chrome')).to.deep.equal({data: 6});
        expect(tree.lookup('choot')).to.deep.equal({data: 7});
        expect(tree.lookup('chrome/coooo/il/li/iloool')).to.deep.equal({data: 9});
        expect(tree.lookup('chrome/*/coooo/il/li/iloool')).to.deep.equal({data: 13});
        expect(tree.lookup('carbon/test1')).to.deep.equal({
            data: 14,
            params: {
                'element': 'test1'
            }
        });
        expect(tree.lookup('carbon/test2/test/test23')).to.deep.equal({
            data: 15,
            params: {
                'element': 'test2',
                'testing': 'test23'
            }
        });
        expect(tree.lookup('this/test/has/more/stuff/seflijsfelisjef')).to.deep.equal({
            data: 16,
            params: {
                route: 'test',
                cool: 'more'
            }
        });
        expect(tree.lookup('this/is')).to.deep.equal({
            data: null,
            params: {
                route: 'is'
            }
        });
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
        expect(tree.lookup('choot')).to.deep.equal({
            data: null
        });
    });

    it('should be able retrieve all results via prefix', () => {
        let tree = new RadixTree();
        tree.insert('hello', 1);
        tree.insert('cool', 2);
        tree.insert('hi', 3);
        tree.insert('helium', 4);
        tree.insert('coooool', 5);
        tree.insert('chrome', 6);
        tree.insert('choot', 7);
        tree.insert('chromium', 8);

        let setA = tree.startsWith('h');
        expect(setA.hasOwnProperty('hello')).to.equal(true);
        expect(setA.hasOwnProperty('hi')).to.equal(true);
        expect(setA.hasOwnProperty('helium')).to.equal(true);

        let setB = tree.startsWith('chro');
        expect(setB.hasOwnProperty('chrome')).to.equal(true);
        expect(setB.hasOwnProperty('chromium')).to.equal(true);

        expect(Object.keys(tree.startsWith('batman')).length).to.equal(0);
    });

});
