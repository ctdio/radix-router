var expect = require('chai').expect
var RadixRouter = require('../index')
var _putRoute = require('./util/putRoute')

describe('Router delete', function () {
  it('should be able to delete nodes', function () {
    var router = new RadixRouter()
    _putRoute(router, 'hello', 1)
    _putRoute(router, 'cool', 2)
    _putRoute(router, 'hi', 3)
    _putRoute(router, 'helium', 4)
    _putRoute(router, 'coooool', 5)
    _putRoute(router, 'chrome', 6)
    _putRoute(router, 'choot', 7)
    _putRoute(router, 'choot/:choo', 8)
    _putRoute(router, 'ui/**', 9)
    _putRoute(router, 'ui/components/**', 10)

    router.delete('choot')
    expect(router.lookup('choot')).to.deep.equal(null)
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/**',
      data: 10
    })
    router.delete('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/**',
      data: 9
    })
  })

  it('should be able to delete placeholder routes', function () {
    var router = new RadixRouter()
    _putRoute(router, 'placeholder/:choo', 8)
    _putRoute(router, 'placeholder/:choo/:choo2', 8)

    expect(router.lookup('placeholder/route')).to.deep.equal({
      path: 'placeholder/:choo',
      params: {
        choo: 'route'
      },
      data: 8
    })

    router.delete('placeholder/:choo')
    expect(router.lookup('placeholder/route')).to.deep.equal(null)

    expect(router.lookup('placeholder/route/route2')).to.deep.equal({
      path: 'placeholder/:choo/:choo2',
      params: {
        choo: 'route',
        choo2: 'route2'
      },
      data: 8
    })
  })

  it('should be able to delete wildcard routes', function () {
    var router = new RadixRouter()
    _putRoute(router, 'ui/**', 9)
    _putRoute(router, 'ui/components/**', 10)
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/**',
      data: 10
    })
    router.delete('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/**',
      data: 9
    })
  })

  it('should return an result signifying that the delete operation was successful or not', function () {
    var router = new RadixRouter()
    _putRoute(router, '/some/route', 1)

    var deleteResult = router.delete('/some/route')
    expect(deleteResult).to.equal(true)

    // route should no longer exist
    deleteResult = router.delete('/some/route')
    expect(deleteResult).to.equal(false)

    deleteResult = router.delete('/some/route/that/never/existed')
    expect(deleteResult).to.equal(false)
  })
})
