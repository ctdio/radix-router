/**
 * JS Radix Router implementation 
 */

const util = require('util');
// node types
var NORMAL_NODE = 0;
var WILDCARD_NODE = 1;
var PLACEHOLDER_NODE = 2;

/**
 * Returns all children that match the prefix
 *
 * @param {Node} - the node to check children for 
 * @param {prefix} - the prefix to match
 */
function _getAllPrefixChildren(node, str) {
    var nodes = [];
    var children = node.children;
    for (var i = 0; i < children.length; i++) {
        // only need to check for first char
        if (children[i].path[0] === str[0]) {
            nodes.push(children[i]);
        }
    }
    return nodes;
}

/**
 * Returns the child matching the prefix
 *
 * @param {Node} - the node to check children for 
 * @param {prefix} - the prefix to match
 */
function _getChildNode(node, prefix) {
    var children = node.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].path === prefix) {
            return children[i];
        }
    }
    return null;
}

/**
 * Retrieves the largest prefix of all children
 *
 * @param {object <string, Node>} children - a dictionary of childNodes
 * @param {string} str - the string used to find the largest prefix with
 */
function _getLargestPrefix(children, str) {
    var index = 0;;

    for (let i = 0; i < children.length; i++) {
        var path = children[i].path;
        var totalIterations = Math.min(str.length, path.length);
        for (; index < totalIterations; index++) {
            if (str[index] !== path[index]) {
                break;
            }
        }
        if (index > 0) {
            break;
        }
    }

    // largest prefix
    return str.slice(0, index);
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
function _traverse(options) {
    var node = options.node;
    var str = options.str;
    var onExactMatch = options.onExactMatch;
    var onPartialMatch = options.onPartialMatch;
    var onNoMatch = options.onNoMatch;
    var onWildcard = options.onWildcard;
    var onPlaceholder = options.onPlaceholder;
    var data = options.data;


    var children = node.children;

    // check if a child is possibly a placeholder or a wildcard
    // if wildcard is found, use it as a backup if no result is found
    var wildcardNode;
    for (var i = 0; i < children.length; i++) {
        if (children[i].type === WILDCARD_NODE) {
            wildcardNode = children[i];
            break;
        } else if (children[i].type === PLACEHOLDER_NODE) {
            // TODO:
        }
    }

    var prefix = _getLargestPrefix(children, str);
    
    // no matches, return null
    if (prefix.length === 0) {
        return onNoMatch(node, str, data) || wildcardNode;
    } 

    // exact match with input string was found
    if (prefix.length === str.length) {
        return onExactMatch(node, prefix, str, data) || wildcardNode;
    }

    // get child
    var childNode = _getChildNode(node, prefix);
    // child exists, continue traversing
    if (childNode) {
        options.node = childNode;
        options.str = str.slice(prefix.length);
        let result = _traverse(options);
        if (!result && wildcardNode) {
            return wildcardNode;
        } else {
            return result;
        }
    }

    // partial match was found
    return onPartialMatch(node, prefix, str, data) || wildcardNode;
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

    node.children.forEach(function(child) {
        _traverseDepths(child, str + child.path, map);
    });
}

function _createNode(path, data) {
    let node;
    if (path[0] === ':') {
        node = new Node(path, data, PLACEHOLDER_NODE);
    } else if(path === '**') {
        node = new Node(path, data, WILDCARD_NODE);
    } else {
        // normal string to match
        node = new Node(path, data);
    }
    return node;
}

function _buildNodeChain(str, data) {
    let parentNode;
    let currentNode;
    let startingPoint = 0;
    let sections = str.split('/');
    // first section is a special case, if it has real content, create a node
    // otherwise, create an empty node
    if (sections[startingPoint].length > 0) {
        parentNode = currentNode = _createNode(sections[startingPoint]);
    } else {
        parentNode = currentNode = new Node('');
    }
    startingPoint++;

    for (var i = startingPoint; i < sections.length; i++) {
        let path;
        let parseRemaining = true;
        let newNode;

        // add slash to last node if the last section was empty
        if (i > 0 && sections[i - 1].length === 0){
            currentNode.path += '/';
        } else if (sections[i].length === 0) {
            newNode = new Node('/');
            parseRemaining = false;
        } else {
            var node = new Node('/');
            currentNode.children.push(node);
            node.parent = currentNode;
            currentNode = node;
        }

        if (parseRemaining) {
            let path = sections[i];
            newNode = _createNode(path);
        }

        currentNode.children.push(newNode);
        newNode.parent = currentNode;
        currentNode = newNode;
    }
    currentNode.data = data;

    return parentNode;
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
    var originalNode;
    var oldIndex;

    var children = node.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].path.startsWith(prefix)) {
            originalNode = children[i];
            oldIndex = i;
            break;
        }
    }

    var newLink = str.substring(prefix.length);
    var oldLink = originalNode.path.substring(prefix.length);

    // set new path
    originalNode.path = oldLink;
    var newNode = _buildNodeChain(newLink, data);
    var intermediateNode = new Node(prefix);

    originalNode.parent = intermediateNode;
    newNode.parent = intermediateNode;
    intermediateNode.parent = node;

    intermediateNode.children.push(originalNode);
    intermediateNode.children.push(newNode);

    node.children.push(intermediateNode);

    // remove old node the list of children
    node.children.splice(oldIndex, 1);
    return newNode;
}

// handle exact matches
var EXACT_MATCH_HANDLERS = {
    'insert': function(node, prefix, str, data) {
        var childNode = _getChildNode(node, prefix);
        childNode.data = data;
        return node;
    },
    'delete': function(parentNode, prefix) {
        var childNode = _getChildNode(parentNode, prefix);
        if (childNode.children.length ===  0) {
            // delete node from parent
            for (var i = 0; i < parentNode.children.length; i++) {
                if (parentNode.children[i].path === prefix) {
                    break;
                }
            }
            parentNode.children.splice(i, 1);
            return 
        } else {
            delete childNode.data;
        }
        return childNode;
    },
    'lookup': function(node, prefix) {
        var discoveredNode = _getChildNode(node, prefix);
        return discoveredNode;
    },
    'startsWith': function(node, prefix, str) {
        var childNode = _getChildNode(node, prefix);
        if (childNode) {
            return childNode;
        }
        return _getAllPrefixChildren(node, prefix);
    }
};

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
        return _getAllPrefixChildren(node, prefix);
    }
};

// handle situtations where there is no match
var NO_MATCH_HANDLERS = {
    'insert': function(parentNode, str, data) {
        var newNode = _buildNodeChain(str, data);
        parentNode.children.push(newNode);
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
};

var WILDCARD_HANDLERS = {
    'insert': function(parentNode, str, data) {
        return 
    },
    'delete': function() {
        return null;
    },
    'lookup': function(wildcardNode) {
        return wildcardNode;
    },
    'startsWith': function() {
        return null;
    }
};

var PLACEHOLDER_HANDLERS = {
    'insert': function(parentNode, str, data) {
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
};

/**
 * Helper method for retrieving all needed action handlers
 * 
 * @param {string} action - the action to perform
 */
function _getHandler(action) {
    return {
        onExactMatch: EXACT_MATCH_HANDLERS[action],
        onPartialMatch: PARTIAL_MATCH_HANDLERS[action],
        onNoMatch: NO_MATCH_HANDLERS[action],
        onWildcard: WILDCARD_HANDLERS[action],
        onPlaceholder: PLACEHOLDER_HANDLERS[action]
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
    return _traverse({
        node: rootNode, 
        str: input, 
        onExactMatch: handlers.onExactMatch, 
        onPartialMatch: handlers.onPartialMatch, 
        onNoMatch: handlers.onNoMatch,
        onWildcard: handlers.onWildcard,
        onPlaceholder: handlers.onWildcard,
        data:data
    });
}

/**
 * Node of the Radix Tree
 * @constructor
 */
function Node(path, data, type) {
    this.type = type || NORMAL_NODE;
    this.path = path;
    this.parent = undefined;
    this.children = [];
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
            result.forEach(function(child) {
                _traverseDepths(child, 
                    prefix.substring(0, prefix.indexOf(child.path[0])) + child.path, 
                    map);
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
