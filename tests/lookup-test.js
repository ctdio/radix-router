var expect = require('chai').expect
var RadixRouter = require('../index')
var _putRoute = require('./util/putRoute')

describe('Router lookup', function () {
  it('should be able lookup static routes', function () {
    var router = new RadixRouter()

    _putRoute(router, '/', true)
    _putRoute(router, '/route', true)
    _putRoute(router, '/another-route', true)
    _putRoute(router, '/this/is/yet/another/route', true)

    expect(router.lookup('/')).to.deep.equal({
      path: '/',
      data: true
    })

    expect(router.lookup('/route')).to.deep.equal({
      path: '/route',
      data: true
    })
    expect(router.lookup('/another-route')).to.deep.equal({
      path: '/another-route',
      data: true
    })
    expect(router.lookup('/this/is/yet/another/route')).to.deep.equal({
      path: '/this/is/yet/another/route',
      data: true
    })
  })

  it('should be able to retrieve placeholders', function () {
    var router = new RadixRouter()
    _putRoute(router, 'carbon/:element', 14)
    _putRoute(router, 'carbon/:element/test/:testing', 15)
    _putRoute(router, 'this/:route/has/:cool/stuff', 16)

    expect(router.lookup('carbon')).to.deep.equal(null)
    expect(router.lookup('carbon/')).to.deep.equal(null)

    expect(router.lookup('carbon/test1')).to.deep.equal({
      path: 'carbon/:element',
      data: 14,
      params: {
        element: 'test1'
      }
    })

    expect(router.lookup('carbon/test2/test/test23')).to.deep.equal({
      path: 'carbon/:element/test/:testing',
      data: 15,
      params: {
        element: 'test2',
        testing: 'test23'
      }
    })

    expect(router.lookup('this/test/has/more/stuff')).to.deep.equal({
      path: 'this/:route/has/:cool/stuff',
      data: 16,
      params: {
        route: 'test',
        cool: 'more'
      }
    })
  })

  it('should be able to perform wildcard lookups', function () {
    var router = new RadixRouter()

    _putRoute(router, 'polymer/**', 12)
    _putRoute(router, 'polymer/another/route', 13)

    expect(router.lookup('polymer/another/route')).to.deep.equal({
      path: 'polymer/another/route',
      data: 13
    })

    expect(router.lookup('polymer/anon')).to.deep.equal({
      path: 'polymer/**',
      data: 12
    })

    expect(router.lookup('polymer/2415')).to.deep.equal({
      path: 'polymer/**',
      data: 12
    })
  })

  it('should be able to match routes with trailing slash', function () {
    var router = new RadixRouter()

    _putRoute(router, 'route/without/trailing/slash', true)
    _putRoute(router, 'route/with/trailing/slash/', true)

    expect(router.lookup('route/without/trailing/slash')).to.deep.equal({
      path: 'route/without/trailing/slash',
      data: true
    })

    expect(router.lookup('route/without/trailing/slash/')).to.deep.equal({
      path: 'route/without/trailing/slash',
      data: true
    })

    expect(router.lookup('route/with/trailing/slash')).to.deep.equal({
      path: 'route/with/trailing/slash/',
      data: true
    })

    expect(router.lookup('route/with/trailing/slash/')).to.deep.equal({
      path: 'route/with/trailing/slash/',
      data: true
    })
  })

  it('should not match routes with trailing slash if router is created with strict mode', function () {
    var router = new RadixRouter({
      strict: true
    })

    _putRoute(router, '/', 1)
    _putRoute(router, '//', 2)
    _putRoute(router, '///', 3)
    _putRoute(router, '////', 4)
    _putRoute(router, 'route/without/trailing/slash', true)
    _putRoute(router, 'route/with/trailing/slash/', true)

    expect(router.lookup('/')).to.deep.equal({
      path: '/',
      data: 1
    })

    expect(router.lookup('//')).to.deep.equal({
      path: '//',
      data: 2
    })

    expect(router.lookup('///')).to.deep.equal({
      path: '///',
      data: 3
    })

    expect(router.lookup('////')).to.deep.equal({
      path: '////',
      data: 4
    })

    expect(router.lookup('route/without/trailing/slash')).to.deep.equal({
      path: 'route/without/trailing/slash',
      data: true
    })

    expect(router.lookup('route/without/trailing/slash/')).to.deep.equal(null)
    expect(router.lookup('route/with/trailing/slash')).to.deep.equal(null)
    expect(router.lookup('route/with/trailing/slash/')).to.deep.equal({
      path: 'route/with/trailing/slash/',
      data: true
    })
  })
})
