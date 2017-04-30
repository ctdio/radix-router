'use strict'
/**
 * JS Radix Router implementation
 */
var assert = require('assert')

// node types
var NORMAL_NODE = 0
var WILDCARD_NODE = 1
var PLACEHOLDER_NODE = 2


function _validateInput (path, strictPaths) {
  assert(path, '"path" must be provided')
  assert(typeof path === 'string', '"path" must be that of a string')

  // allow for trailing slashes to match by removing it
  if (!strictPaths && path.length > 1 && path[path.length - 1] === '/') {
    path = path.slice(0, path.length - 1)
  }

  return path
}

function _getNodeType (str) {
  var type

  if (str[0] === ':') {
    type = PLACEHOLDER_NODE
  } else if (str === '**'){
    type = WILDCARD_NODE
  } else {
    type = NORMAL_NODE
  }

  return type
}

/**
 * Node of the Radix Tree
 * @constructor
 */
function Node (options) {
  options = options || {}
  this.type = options.type || NORMAL_NODE

  // if placeholder node
  this.paramName = options.paramName

  this.parent = options.parent || null
  this.children = {}
  this.data = options.data || null

  // keep track of special child nodes
  this.wildcardChildNode = null;
  this.placeholderChildNode = null;
}

/**
 * The Radix Router
 * @constructor
 */
function RadixRouter (options) {
  var self = this
  self._rootNode = new Node()
  self._strictMode = options && options.strict
  self._staticRoutes = {}

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

    // optimization, if a route is static and does not have any
    // variable sections, retrieve from a static routes map
    var staticPathNode
    if (staticPathNode = self._staticRoutes[path]) {
      return staticPathNode.data
    }

    var chunks = path.split('/')

    var node = self._rootNode

    var hasParams = false
    var params = {}
    var wildcardNode = null

    for (var i = 0; i < chunks.length; i++) {
      var chunk = chunks[i]

      if (node.wildcardChildNode !== null) {
        wildcardNode = node.wildcardChildNode
      }

      // exact matches take precedence over placeholders
      var nextNode = node.children[chunk]
      if (nextNode !== undefined) {
        node = nextNode
      } else if (node.placeholderChildNode !== null) {
        hasParams = true
        node = node.placeholderChildNode
        params[node.paramName] = chunk
      } else {
        node = null
        break
      }
    }

    var result = (node !== null && node.data) ||
      (wildcardNode !== null && wildcardNode.data) || null

    if (result !== null && hasParams === true) {
      result.params = params
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
      /*
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
    */
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
    var isStaticRoute = true

    path = _validateInput(path, self._strictMode)

    var chunks = path.split('/')

    var node = self._rootNode

    for (var i = 0; i < chunks.length; i++) {
      var chunk = chunks[i]

      var children = node.children
      var childNode

      if (childNode = children[chunk]) {
        node = childNode
      } else {
        var type = _getNodeType(chunk)

        // create new node to represent the next
        // part of the path
        childNode = new Node({
          type: type,
          parent: node
        })

        node.children[chunk] = childNode

        if (type === PLACEHOLDER_NODE) {
          childNode.paramName = chunk.slice(1)
          node.placeholderChildNode = childNode
          isStaticRoute = false
        } else if (type === WILDCARD_NODE) {
          node.wildcardChildNode = childNode
          isStaticRoute = false
        }

        node = childNode
      }
    }

    // store whatever data was provided into the node
    node.data = data


    // optimization, if a route is static and does not have any
    // variable sections, we can store it into a map for faster
    // retrievals
    if (isStaticRoute === true) {
      self._staticRoutes[path] = node
    }

    return node
  },

  /**
   * Perform a remove on the tree
   * @param { string } data.path - the route to match
   *
   * @returns { boolean }  A boolean signifying if the remove was
   * successful or not
   */
  remove: function (path) {
    var self = this
    path = _validateInput(path, self._strictMode)
    var result = { success: false }
    _startTraversal(self._rootNode, 'remove', path, result)
    return result.success
  }
}

module.exports = RadixRouter
