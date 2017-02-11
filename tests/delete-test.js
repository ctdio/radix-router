const {expect} = require('chai')
const RadixRouter = require('../index')

describe('Router delete', () => {
  it('should be able to delete nodes', () => {
    let router = new RadixRouter()
    router.insert('hello', 1)
    router.insert('cool', 2)
    router.insert('hi', 3)
    router.insert('helium', 4)
    router.insert('coooool', 5)
    router.insert('chrome', 6)
    router.insert('choot', 7)
    router.insert('choot/:choo', 8)
    router.insert('ui/**', 9)
    router.insert('ui/components/**', 10)

    router.delete('choot')
    expect(router.lookup('choot')).to.deep.equal({
      path: 'choot',
      data: null
    })
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/snackbars',
      data: 10
    })
    router.delete('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/snackbars',
      data: 9
    })
  })

  it('should be able to delete placeholder routes', () => {
    let router = new RadixRouter()
    router.insert('placeholder/:choo', 8)
    router.insert('placeholder/:choo/:choo2', 8)

    expect(router.lookup('placeholder/route')).to.deep.equal({
      path: 'placeholder/route',
      params: {
        choo: 'route'
      },
      data: 8
    })

    router.delete('placeholder/:choo')
    expect(router.lookup('placeholder/route')).to.deep.equal({
      path: 'placeholder/route',
            // placeholder still exists because of other route
      params: {
        choo: 'route'
      },
            // data is set to null after deletion
      data: null
    })

    expect(router.lookup('placeholder/route/route2')).to.deep.equal({
      path: 'placeholder/route/route2',
      params: {
        choo: 'route',
        choo2: 'route2'
      },
      data: 8
    })
  })

  it('should be able to delete wildcard routes', () => {
    let router = new RadixRouter()
    router.insert('ui/**', 9)
    router.insert('ui/components/**', 10)
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/snackbars',
      data: 10
    })
    router.delete('ui/components/**')
    expect(router.lookup('ui/components/snackbars')).to.deep.equal({
      path: 'ui/components/snackbars',
      data: 9
    })
  })
})
