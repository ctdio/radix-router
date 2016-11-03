/**
 * JS Radix tree implementation 
 */

/**
 * Retrieves the largest prefix of all children
 */
function getLargestPrefix(children, str) {
    let length = 0;

    Object.keys(children).forEach(function(key) {
        for (var i = 0; i < key.length; i++) {
            if (str[i] !== key[i] || i > length) {
                break;
            }
            length = i + 1;
        }
    });

    return str.substring(0, length);
}

/**
 * Traverses the tree to find the node that the input string matches.
 */
function lookup(node, str, options) {
    var children = node.children;
    var prefix = getLargestPrefix(children, str);

    // no matches, return null
    if (prefix.length === 0) {
        return null;
    } 

    // get child
    let child = node.children[prefix];

    // nowhere to go from here.
    if (prefix.length === str.length) {
        // delete node if node is passed,
        // otherwise return the match
        if (child && options && options.deleteNode) {
            if (Object.keys(child.children).length ===  0) {
                delete node.children[prefix];
            } else {
                delete child.data;
            }
        }

        return child;
    }

    // child exists, continue traversing
    if (child) {
        return lookup(child, str.substring(prefix.length), options);
    }

    return null;
}

/**
 * Splits a node in half, placing an intermediary node between the
 * parent node and the two resulting nodes from the split
 */
function splitNode(node, prefix, str, data) {
    var length = 0;
    var closestMatch;

    var keys = Object.keys(node.children);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].startsWith(prefix)) {
            closestMatch = keys[i];
            break;
        }
    }

    var newLink = str.substring(prefix.length);
    var oldLink = closestMatch.substring(prefix.length);

    var originalNode = node.children[closestMatch];
    var newNode = new Node(data);
    var intermediateNode = new Node();

    originalNode.parent = intermediateNode;
    newNode.parent = intermediateNode;

    intermediateNode.children[oldLink] = originalNode;
    intermediateNode.children[newLink] = newNode;

    node.children[prefix] = intermediateNode;

    delete node.children[closestMatch];
}

/**
 * Inserts node with the given data into the tree
 */
function put(node, str, data) {
    var children = node.children;
    var prefix = getLargestPrefix(children, str);

    // no prefix match
    if (prefix.length === 0) {
        // drop in the node
        var newNode = node.children[str] = new Node(data);
        newNode.parent = node;
        return;
    } 

    if (prefix.length === str.length) {
        // exact match found, set data in node
        node.children[prefix].data = data;
        return;
    }

    // if match found, continue traversing, else
    // partial match was found, split the node
    var child = node.children[prefix];
    if (child) {
        put(child, str.substring(prefix.length), data);
    } else {
        splitNode(node, prefix, str, data);
    }
}

function _validateInput(str) {
    if (typeof str !== 'string') {
        throw new Error('Radix Tree input must be a string');
    }
}

function Node(data) {
    this.parent = undefined;
    this.children = {};
    this.data = data;
}

function RadixTree(options) {
    this._rootNode = new Node();
    // TODO: handle routes passed in via options
}


RadixTree.prototype = {
    lookup: function(input) {
        let node = lookup(this._rootNode, input);
        return node && node.data;
    },

    startsWith: function(prefix) {
        // TODO: complete this
    },

    insert: function(input, data) {
        put(this._rootNode, input, data);
    },

    delete: function(input) {
        lookup(this._rootNode, input, {
            deleteNode: true
        });
    }
};

module.exports = RadixTree;
