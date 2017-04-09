'use strict'
/**
 * JS Radix Router implementation
 */
var assert = require('assert')

// node types
var NORMAL_NODE = 0
var WILDCARD_NODE = 1
var PLACEHOLDER_NODE = 2

/**
 * Returns all children that match the prefix
 *
 * @param {Node} - the node to check children for
 * @param {prefix} - the prefix to match
 */
function _getAllPrefixChildren (node, str) {
  var nodes = []
  var children = node.children
  for (var i = 0; i < children.length; i++) {
    // only need to check for first char
    if (children[i].path[0] === str[0]) {
      nodes.push(children[i])
    }
  }
  return nodes
}

/**
 * Returns the child matching the prefix
 *
 * @param {Node} - the node to check children for
 * @param {prefix} - the prefix to match
 */
function _getChildNode (node, prefix) {
  var children = node.children
  for (var i = 0; i < children.length; i++) {
    if (children[i].path === prefix) {
      return children[i]
    }
  }
  return null
}

/**
 * Retrieves the largest prefix of all children
 *
 * @param {object <string, Node>} children - a dictionary of childNodes
 * @param {string} str - the string used to find the largest prefix with
 */
function _getLargestPrefix (children, str) {
  var index = 0
  for (var i = 0; i < children.length; i++) {
    var path = children[i].path
    var totalIterations = Math.min(str.length, path.length)
    while (index < totalIterations) {
      if (str[index] !== path[index]) {
        break
      }
      index++
    }
    if (index > 0) {
      break
    }
  }

    // largest prefix
  return str.slice(0, index)
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
function _traverse (options) {
  var node = options.node
  var str = options.str
  var onExactMatch = options.onExactMatch
  var onPartialMatch = options.onPartialMatch
  var onNoMatch = options.onNoMatch
  var onPlaceholder = options.onPlaceholder
  var data = options.data

  var children = node.children
  var childNode

  // check if a child is possibly a placeholder or a wildcard
  // if wildcard is found, use it as a backup if no result is found,
  // if placeholder is found, grab the data and traverse
  var wildcardNode = null
  if (onPlaceholder) {
    for (var i = 0; i < children.length; i++) {
      childNode = children[i]
      if (children[i].type === WILDCARD_NODE) {
        wildcardNode = childNode
      } else if (children[i].type === PLACEHOLDER_NODE) {
        var key = childNode.path.slice(1)
        var slashIndex = str.indexOf('/')

        var param
        if (slashIndex !== -1) {
          param = str.slice(0, slashIndex)
        } else {
          param = str
        }

        options.node = children[i]
        options.str = str.slice(param.length)

        return onPlaceholder({
          key: key,
          param: param,
          options: options,
          childNode: childNode
        })
      }
    }
  }

  var prefix = _getLargestPrefix(children, str)

  // no matches, return null
  if (prefix.length === 0) {
    return onNoMatch(options) || wildcardNode
  }

  // exact match with input string was found
  if (prefix.length === str.length) {
    return onExactMatch({
      node: node,
      prefix: prefix,
      str: str,
      data: data
    }) || wildcardNode
  }

  // get child
  childNode = _getChildNode(node, prefix)

  // child exists, continue traversing
  if (childNode) {
    options.node = childNode
    options.str = str.slice(prefix.length)
    var result = _traverse(options)
    // if no result, return the wildcard node
    if (!result && wildcardNode) {
      return wildcardNode
    } else {
      return result
    }
  }

  // partial match was found
  return onPartialMatch({
    node: node,
    prefix: prefix,
    str: str,
    data: data
  }) || wildcardNode
}

/**
 * Traverses all child nodes places the full resulting path into a map
 *
 * @param {Node} node - the node to attempt to traverse
 * @param {string} str - the string that is the base of the key
 * @param {object} map - the map to traverse the cobrowse event with
 */
function _traverseDepths (node, str, array) {
  if (node.data) {
    array.push(node.data)
  }

  node.children.forEach(function (child) {
    _traverseDepths(child, str + child.path, array)
  })
}

/**
 * Helper function for creating a node based the path and data it is given
 */
function _createNode (path, data) {
  var node
  if (path[0] === ':') {
    node = new Node(path, data, PLACEHOLDER_NODE)
  } else if (path === '**') {
    node = new Node(path, data, WILDCARD_NODE)
  } else {
    // normal string to match
    node = new Node(path, data)
  }
  return node
}

function _buildNodeChain (str, data) {
  var parentNode
  var currentNode
  var startingPoint = 0

  // if the string is just a single slash, return the node
  // otherwise just slash the node
  if (str.length === 0 || str === '/') {
    return new Node('/', data)
  }

  var sections = str.split('/')

  // first section is a special case, if it has real content, create a node
  // otherwise, create an empty node
  if (sections[startingPoint].length > 0) {
    parentNode = currentNode = _createNode(sections[startingPoint])
  } else {
    parentNode = currentNode = new Node('')
  }
  startingPoint++

  for (var i = startingPoint; i < sections.length; i++) {
    var parseRemaining = true
    var newNode

    // add slash to last node if the last section was empty
    if (i > 0 && sections[i - 1].length === 0) {
      currentNode.path += '/'
    } else if (sections[i].length === 0) {
      newNode = new Node('/')
      parseRemaining = false
    } else {
      var node = new Node('/')
      currentNode.children.push(node)
      node.parent = currentNode
      currentNode = node
    }

    if (parseRemaining) {
      var path = sections[i]
      newNode = _createNode(path)
    }

    currentNode.children.push(newNode)
    newNode.parent = currentNode
    currentNode = newNode
  }

  // if the last node's path is empty, remove it.
  if (currentNode.path === '') {
    currentNode.parent.children = []
    currentNode.parent.data = data
  } else {
    currentNode.data = data
  }

  return parentNode
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
function _splitNode (node, prefix, str, data) {
  var originalNode
  var oldIndex

  var children = node.children
  for (var i = 0; i < children.length; i++) {
    if (children[i].path.startsWith(prefix)) {
      originalNode = children[i]
      oldIndex = i
      break
    }
  }

  var newLink = str.substring(prefix.length)
  var oldLink = originalNode.path.substring(prefix.length)

  // set new path
  originalNode.path = oldLink
  var newNode = _buildNodeChain(newLink, data)
  var intermediateNode = new Node(prefix)

  originalNode.parent = intermediateNode
  newNode.parent = intermediateNode
  intermediateNode.parent = node

  intermediateNode.children.push(originalNode)
  intermediateNode.children.push(newNode)

  node.children.push(intermediateNode)

  // remove old node the list of children
  node.children.splice(oldIndex, 1)
  return newNode
}

// handle exact matches
var EXACT_MATCH_HANDLERS = {
  'insert': function (options) {
    var node = options.node
    var prefix = options.prefix
    var data = options.data
    var childNode = _getChildNode(node, prefix)
    childNode.data = data
    return node
  },
  'delete': function (options) {
    var parentNode = options.node
    var prefix = options.prefix
    var result = options.data

    var childNode = _getChildNode(parentNode, prefix)

    if (childNode.data) {
      result.success = true
    }

    if (childNode.children.length === 0) {
      // delete node from parent
      for (var i = 0; i < parentNode.children.length; i++) {
        if (parentNode.children[i].path === prefix) {
          break
        }
      }
      parentNode.children.splice(i, 1)

      if (parentNode.children.length === 1) {
        var lastChildNode = parentNode.children[0]
        if (parentNode.data && Object.keys(parentNode.data).length === 1) {
          // no real data is associated with the parent
          if (parentNode.type === NORMAL_NODE && parentNode.path !== '/' &&
            lastChildNode.type === NORMAL_NODE && lastChildNode.path !== '/') {
            // child node just a regular node, merge them together
            parentNode.children = []
            parentNode.path += lastChildNode.path
            parentNode.data = lastChildNode.data
            parentNode.data.path = parentNode.path
          }
        }
      }
    } else {
      childNode.data = null
    }

    return childNode
  },
  'lookup': function (options) {
    var node = options.node
    var prefix = options.prefix
    var discoveredNode = _getChildNode(node, prefix)
    return discoveredNode
  },
  'startsWith': function (options) {
    var node = options.node
    var prefix = options.prefix
    var childNode = _getChildNode(node, prefix)
    if (childNode) {
      return childNode
    }
    return _getAllPrefixChildren(node, prefix)
  }
}

// handle situations where there is a partial match
var PARTIAL_MATCH_HANDLERS = {
  'insert': function (options) {
    var node = options.node
    var prefix = options.prefix
    var str = options.str
    var data = options.data
    var newNode = _splitNode(node, prefix, str, data)
    return newNode
  },
  'delete': function () {
    return null
  },
  'lookup': function () {
    return null
  },
  'startsWith': function (options) {
    var node = options.node
    var prefix = options.prefix
    return _getAllPrefixChildren(node, prefix)
  }
}

// handle situtations where there is no match
var NO_MATCH_HANDLERS = {
  'insert': function (options) {
    var parentNode = options.node
    var str = options.str
    var data = options.data
    var newNode = _buildNodeChain(str, data)
    parentNode.children.push(newNode)
    newNode.parent = parentNode
    return newNode
  },
  'delete': function () {
    return null
  },
  'lookup': function () {
    return null
  },
  'startsWith': function () {
    return []
  }
}

function _onPlaceholder (placeholderOptions) {
  var options = placeholderOptions.options
  var childNode = options.node
  var parentNode = options.node.parent
  var str = options.str
  var data = options.data

    // return the child node if there is nowhere else to go
    // otherwise, traverse to the child
  if (options.str.length === 0) {
    return options.onExactMatch({
      node: parentNode,
      prefix: childNode.path,
      str: str,
      data: data
    })
  }
  return _traverse(options)
}

// handle situations where a place holder was found
var PLACEHOLDER_HANDLERS = {
  // lookup handles placeholders differently
  'lookup': function (placeholderOptions) {
    var key = placeholderOptions.key
    var param = placeholderOptions.param
    var options = placeholderOptions.options
    var data = options.data

    if (!data.params) {
      data.params = {}
    }
    data.params[key] = param

    if (options.str.length === 0) {
      return options.node
    }

    return _traverse(options)
  },

  // inserts shouldn't care about placeholders at all
  'insert': null,
  'delete': _onPlaceholder,
  'startsWith': _onPlaceholder
}

/**
 * Helper method for retrieving all needed action handlers
 *
 * @param {string} action - the action to perform
 */
function _getHandlers (action) {
  return {
    onExactMatch: EXACT_MATCH_HANDLERS[action],
    onPartialMatch: PARTIAL_MATCH_HANDLERS[action],
    onNoMatch: NO_MATCH_HANDLERS[action],
    onPlaceholder: PLACEHOLDER_HANDLERS[action]
  }
}

function _validateInput (input, strictPaths) {
  var path = input
  assert(path, '"path" must be provided')
  assert(typeof path === 'string', '"path" must be that of a string')

  // allow for trailing slashes to match by removing it
  if (!strictPaths && path.length > 1 && path[path.length - 1] === '/') {
    path = path.slice(0, path.length - 1)
  }

  return path
}

/**
 * Kicks off the traversal
 *
 * @param {Node} rootNode - the node to start from
 * @param {string} action - the action to perform, this will be used to get handlers
 * @param {string} input - the string to use for traversal
 * @param {object} data - the object to store in the Radix Tree
 */
function _startTraversal (rootNode, action, input, data) {
  var handlers = _getHandlers(action)
  return _traverse({
    node: rootNode,
    str: input,
    onExactMatch: handlers.onExactMatch,
    onPartialMatch: handlers.onPartialMatch,
    onNoMatch: handlers.onNoMatch,
    onPlaceholder: handlers.onPlaceholder,
    data: data
  })
}

/**
 * Node of the Radix Tree
 * @constructor
 */
function Node (path, data, type) {
  this.type = type || NORMAL_NODE
  this.path = path
  this.parent = undefined
  this.children = []
  this.data = data || null
}

/**
 * The Radix Router
 * @constructor
 */
function RadixRouter (options) {
  var self = this
  self._rootNode = new Node()
  self._strictMode = options && options.strict

  // handle insertion of routes passed into constructor
  var routes = options && options.routes
  if (routes) {
    routes.forEach(function (route) {
      self.insert(route)
    })
  }
}

RadixRouter.prototype = {
  /**
   * Perform lookup of given path in radix tree
   * @param { string } path - the path to search for
   *
   * @returns { object } The data that was originally inserted into the tree
   */
  lookup: function (path) {
    var self = this
    path = _validateInput(path, self._strictMode)
    var data = {}

    // find the node
    var node = _startTraversal(self._rootNode, 'lookup', path, data)
    var result = node && node.data

    if (result && data.params) {
      result.params = data.params
    }

    return result
  },

  /**
   * Perform lookup of all paths that start with the given prefix
   * @param { string } prefix - the prefix to match
   *
   * @returns { object[] } An array of matches along with any data that
   * was originally passed in when inserted
   */
  startsWith: function (prefix) {
    var self = this
    _validateInput(prefix, self._strictMode)
    var result = _startTraversal(self._rootNode, 'startsWith', prefix)

    var resultArray = []
    if (result instanceof Node) {
      _traverseDepths(result, prefix, resultArray)
    } else {
      result.forEach(function (child) {
        _traverseDepths(child,
          prefix.substring(0, prefix.indexOf(child.path[0])) + child.path,
          resultArray)
      })
    }
    return resultArray
  },

  /**
   * Perform an insert into the radix tree
   * @param { string } data.path - the prefix to match
   *
   * Note: any other params attached to the data object will
   * also be inserted as part of the node's data
   */
  insert: function (data) {
    var self = this
    var path = data.path

    path = _validateInput(path, self._strictMode)
    _startTraversal(self._rootNode, 'insert', path, data)
  },

  /**
   * Perform a delete on the tree
   * @param { string } data.path - the route to match
   *
   * @returns { boolean }  A boolean signifying if the delete was
   * successful or not
   */
  delete: function (input) {
    var self = this
    var path = _validateInput(input, self._strictMode)
    var result = { success: false }
    _startTraversal(self._rootNode, 'delete', path, result)
    return result.success
  }
}

module.exports = RadixRouter
