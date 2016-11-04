/**
 * JS Radix Router implementation 
 */

function _getAllPrefixChildren(children, str) {
    var nodes = {};
    Object.keys(children).forEach(function(key) {
        var i;
        for (i = 0; i < str.length; i++) {
            if (key[i] !== str[i]) {
                break;
            }
        }
        // it's a prefix
        if (i === str.length) {
            nodes[key] = children[key]
        }
    });
    return nodes;
}

/**
 * Retrieves the largest prefix of all children
 *
 * @param {object <string, Node>} children - a dictionary of childNodes
 * @param {string} str - the string used to find the largest prefix with
 */
function _getLargestPrefix(children, str) {
    var length = 0;

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
 *
 * @param {Node} node - the node to attempt to traverse
 * @param {string} str - the string used as the basis for traversal
 * @param {function} onExactMatch - the handler for exact matches
 * @param {function} onPartialMatch - the handler for partial matches
 * @param {function} onNoMatch - the handler for when no match is found
 */
function _traverse(node, str, onExactMatch, onPartialMatch, onNoMatch, data) {
    var children = node.children;
    var prefix = _getLargestPrefix(children, str);

    // no matches, return null
    if (prefix.length === 0) {
        return onNoMatch(node, str, data); 
    } 

    // exact match was found
    if (prefix.length === str.length) {
        return onExactMatch(node, prefix, str, data);
    }

    // get child
    var childNode = node.children[prefix];
    // child exists, continue traversing
    if (childNode) {
        return _traverse(childNode, 
            str.substring(prefix.length), 
            onExactMatch, 
            onPartialMatch, 
            onNoMatch,
            data);
    } 

    // partial match was found
    return onPartialMatch(node, prefix, str, data);
}

/**
 * Traverses all child nodes places the full resulting path into a map
 *
 * @param {Node} node - the node to attempt to traverse
 * @param {string} str - the string that is the base of the key
 * @param {object} map - the map to traverse the cobrowse event with
 */
function _traverseDepths(node, str, map) {
    if (node.data) {
        map[str] = node.data;
    }

    Object.keys(node.children).forEach(function(key) {
        _traverseDepths(node.children[key], str + key, map);
    });
}

/**
 * Splits a node in half, placing an intermediary node between the
 * parent node and the two resulting nodes from the split
 *
 * @param {Node} node - the node to split
 * @param {string} prefix - the largest prefix found
 * @param {string} str - the leftover parts of the input string
 * @param {object} data - the data to store in the new node
 */
function _splitNode(node, prefix, str, data) {
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
    intermediateNode.parent = node;

    intermediateNode.children[oldLink] = originalNode;
    intermediateNode.children[newLink] = newNode;

    node.children[prefix] = intermediateNode;

    delete node.children[closestMatch];
    return newNode;
}

// handle exact matches
var EXACT_MATCH_HANDLERS = {
    'insert': function(node, prefix, str, data) {
        node.children[prefix].data = data;
        return node;
    },
    'delete': function(parentNode, prefix) {
        var childNode = parentNode.children[prefix];
        if (Object.keys(childNode.children).length ===  0) {
            // delete node from parent
            delete parentNode.children[prefix];
        } else {
            delete childNode.data;
        }
        return childNode;
    },
    'lookup': function(node, prefix) {
        var newNode = node.children[prefix];
        return newNode;
    },
    'startsWith': function(node, prefix, str) {
        if (node.children[prefix]) {
            return node.children[prefix];
        }
        return _getAllPrefixChildren(node.children, prefix);
    }
}

// handle situations where there is a partial match
var PARTIAL_MATCH_HANDLERS = {
    'insert': function(node, prefix, str, data) {
        var newNode = _splitNode(node, prefix, str, data);
        return newNode;
    },
    'delete': function() {
        return null;
    },
    'lookup': function(node) {
        return null;
    },
    'startsWith': function(node, prefix) {
        return _getAllPrefixChildren(node.children, prefix);
    }
}

// handle situtations where there is no match
var NO_MATCH_HANDLERS = {
    'insert': function(parentNode, str, data) {
        var newNode = parentNode.children[str] = new Node(data);
        newNode.parent = parentNode;
        return newNode;
    },
    'delete': function() {
        return null;
    },
    'lookup': function() {
        return null;
    },
    'startsWith': function() {
        return null;
    }
}

/**
 * Helper method for retrieving all needed action handlers
 * 
 * @param {string} action - the action to perform
 */
function _getHandler(action) {
    return {
        onExactMatch: EXACT_MATCH_HANDLERS[action],
        onPartialMatch: PARTIAL_MATCH_HANDLERS[action],
        onNoMatch: NO_MATCH_HANDLERS[action]
    }
}


function _validateInput(str) {
    if (typeof str !== 'string') {
        throw new Error('Radix Tree input must be a string');
    }
}

/**
 * Kicks off the traversal
 *
 * @param {Node} rootNode - the node to start from
 * @param {string} action - the action to perform, this will be used to get handlers
 * @param {string} input - the string to use for traversal
 * @param {object} data - the object to store in the Radix Tree
 */
function _startTraversal(rootNode, action, input, data) {
    var handlers = _getHandler(action);
    return _traverse(rootNode, 
        input, 
        handlers.onExactMatch, 
        handlers.onPartialMatch, 
        handlers.onNoMatch,
        data);
}

/**
 * Node of the Radix Tree
 * @constructor
 */
function Node(data) {
    this.parent = undefined;
    this.children = {};
    this.data = data;
}

/**
 * The Radix Router
 * @constructor
 */
function RadixRouter(options) {
    this._rootNode = new Node();
    // TODO: handle routes passed in via options
}


RadixRouter.prototype = {
    lookup: function(input) {
        _validateInput(input);
        var node = _startTraversal(this._rootNode, 'lookup', input);
        return node && node.data;
    },

    startsWith: function(prefix) {
        _validateInput(prefix);
        var result = _startTraversal(this._rootNode, 'startsWith', prefix);

        var map = {};
        if (result instanceof Node) {
            _traverseDepths(result, prefix, map);
        } else {
            Object.keys(result).forEach(function(key) {
                _traverseDepths(result[key], prefix.substring(0, prefix.indexOf(key[0])) + key, map);
            });
        }

        return map;
    },

    insert: function(input, data) {
        _validateInput(input);
        return _startTraversal(this._rootNode, 'insert', input, data);
    },

    delete: function(input) {
        _validateInput(input);
        return  _startTraversal(this._rootNode, 'delete', input);
    }
};

module.exports = RadixRouter;
