const expect = require('chai').expect
const RadixRouter = require('../index')
const _putRoute = require('./util/putRoute')

function containsPath(array, path, data) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].path === path && array[i].data === data) {
      return true
    }
  }
  return false
}

describe('Router startsWith', function() {
  it('should be able retrieve all results via prefix', function() {
    const router = new RadixRouter()
    _putRoute(router, 'hello', 1)
    _putRoute(router, 'hi', 2)
    _putRoute(router, 'helium', 3)
    _putRoute(router, 'chrome', 6)
    _putRoute(router, 'choot', 7)
    _putRoute(router, 'chromium', 8)

    const setA = router.startsWith('h')
    expect(setA.length).to.equal(3)
    expect(containsPath(setA, 'hello', 1)).to.equal(true)
    expect(containsPath(setA, 'hi', 2)).to.equal(true)
    expect(containsPath(setA, 'helium', 3)).to.equal(true)

    const setB = router.startsWith('c')
    expect(containsPath(setB, 'chrome', 6)).to.equal(true)
    expect(containsPath(setB, 'choot', 7)).to.equal(true)
    expect(containsPath(setB, 'chromium', 8)).to.equal(true)
  })
})
