var expect = require('chai').expect
var RadixRouter = require('../index')
var _putRoute = require('./util/putRoute')

describe('Router remove', function () {
  it('should be able to remove nodes', function () {
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

    router.remove('choot')
    expect(router.lookup('choot')).to.deep.equal(null)
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/**',
      data: 10
    })
    router.remove('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/**',
      data: 9
    })
  })

  it('should be able to remove placeholder routes', function () {
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

    router.remove('placeholder/:choo')
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

  it('should be able to remove wildcard routes', function () {
    var router = new RadixRouter()
    _putRoute(router, 'ui/**', 9)
    _putRoute(router, 'ui/components/**', 10)
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/**',
      data: 10
    })
    router.remove('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/**',
      data: 9
    })
  })

  it('should return a result signifying that the remove operation was successful or not', function () {
    var router = new RadixRouter()
    _putRoute(router, '/some/route', 1)

    var removeResult = router.remove('/some/route')
    expect(removeResult).to.equal(true)

    // route should no longer exist
    removeResult = router.remove('/some/route')
    expect(removeResult).to.equal(false)

    removeResult = router.remove('/some/route/that/never/existed')
    expect(removeResult).to.equal(false)
  })
})
