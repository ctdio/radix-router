var expect = require('chai').expect
var RadixRouter = require('../index')

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
    router.insert('hello', 1)
    router.insert('hi', 2)
    router.insert('helium', 3)
    router.insert('chrome', 6)
    router.insert('choot', 7)
    router.insert('chromium', 8)
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
