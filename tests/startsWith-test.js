var expect = require('chai').expect
var RadixRouter = require('../index')
var _putRoute = require('./util/putRoute')

function containsPath (array, path) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].path === path) {
      return true
    }
  }
  return false
}

describe('Router startsWith', function () {
  it('should be able retrieve all results via prefix', function () {
    var router = new RadixRouter()
    _putRoute(router, 'hello', 1)
    _putRoute(router, 'hi', 2)
    _putRoute(router, 'helium', 3)
    _putRoute(router, 'chrome', 6)
    _putRoute(router, 'choot', 7)
    _putRoute(router, 'chromium', 8)
    var setA = router.startsWith('h')
    expect(setA.length).to.equal(3)
    expect(containsPath(setA, 'hello')).to.equal(true)
    expect(containsPath(setA, 'hi')).to.equal(true)
    expect(containsPath(setA, 'helium')).to.equal(true)

    var setB = router.startsWith('c')
    expect(containsPath(setB, 'chrome')).to.equal(true)
    expect(containsPath(setB, 'choot')).to.equal(true)
    expect(containsPath(setB, 'chromium')).to.equal(true)
  })
})
