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

  var pathEnd
  // allow for trailing slashes to match by removing it
  if (!strictPaths && path.length > 1 && path[(pathEnd = path.length - 1)] === '/') {
    path = path.slice(0, pathEnd)
  }

  return path
}

/**
 * Node of the Radix Tree
 * @constructor
 */
function Node (options) {
  options = options || {}
  this.type = options.type || NORMAL_NODE

  // if placeholder node
  this.paramName = options.paramName || null

  this.parent = options.parent || null
  this.children = {}
  this.data = options.data || null

  // keep track of special child nodes
  this.wildcardChildNode = null
  this.placeholderChildNode = null
}

function _getNodeType (str) {
  var type

  if (str[0] === ':') {
    type = PLACEHOLDER_NODE
  } else if (str === '**') {
    type = WILDCARD_NODE
  } else {
    type = NORMAL_NODE
  }

  return type
}

function _findNode (path, rootNode) {
  var sections = path.split('/')

  var params = {}
  var paramsFound = false
  var wildcardNode = null
  var node = rootNode

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i]

    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode
    }

    // exact matches take precedence over placeholders
    var nextNode = node.children[section]
    if (nextNode !== undefined) {
      node = nextNode
    } else {
      node = node.placeholderChildNode
      if (node !== null) {
        params[node.paramName] = section
        paramsFound = true
      } else {
        break
      }
    }
  }

  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode
  }

  return {
    node: node,
    params: paramsFound ? params : undefined
  }
}

function _getAllNodesWithData (node, resultArray) {
  var keys = Object.keys(node.children)

  for (var i = 0; i < keys.length; i++) {
    var nextNode = node.children[keys[i]]
    _getAllNodesWithData(nextNode, resultArray)
  }
}

/**
 * The Radix Router
 * @constructor
 */
function RadixRouter (options) {
  var self = this
  self._rootNode = new Node()
  self._strictMode = options && options.strict
  self._staticRoutesMap = {}

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
    if ((staticPathNode = self._staticRoutesMap[path])) {
      return staticPathNode.data
    }

    var result = _findNode(path, self._rootNode)
    var node = result.node
    var params = result.params

    var data = (node !== null && node.data) || null

    if (data !== null && params !== undefined) {
      data.params = params
    }

    return data
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
    prefix = _validateInput(prefix, self._strictMode)

    var sections = prefix.split('/')
    var node = self._rootNode
    var resultArray = []
    var endSections = sections.length - 1

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i]

      if (node.data) {
        resultArray.push(node.data)
      }

      var nextNode = node.children[section]

      if (nextNode !== undefined) {
        node = nextNode
      } else if (i === endSections) {
        var keys = Object.keys(node.children)

        for (var j = 0; j < keys.length; j++) {
          var key = keys[j]

          if (key.startsWith(section)) {
            nextNode = node.children[key]

            if (nextNode.data) {
              resultArray.push(nextNode.data)
            }
            _getAllNodesWithData(nextNode, resultArray)
          }
        }
      }
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
    var isStaticRoute = true

    path = _validateInput(path, self._strictMode)

    var sections = path.split('/')

    var node = self._rootNode

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i]

      var children = node.children
      var childNode

      if ((childNode = children[section])) {
        node = childNode
      } else {
        var type = _getNodeType(section)

        // create new node to represent the next
        // part of the path
        childNode = new Node({
          type: type,
          parent: node
        })

        node.children[section] = childNode

        if (type === PLACEHOLDER_NODE) {
          childNode.paramName = section.slice(1)
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
      self._staticRoutesMap[path] = node
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

    var success = false
    var sections = path.split('/')
    var node = self._rootNode

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i]
      node = node.children[section]
      if (!node) {
        return success
      }
    }

    if (node.data) {
      var lastSection = sections[sections.length - 1]
      node.data = null
      if (Object.keys(node.children).length === 0) {
        var parentNode = node.parent
        delete parentNode[lastSection]
        parentNode.wildcardChildNode = null
        parentNode.placeholderChildNode = null
      }
      success = true
    }

    return success
  }
}

module.exports = RadixRouter
