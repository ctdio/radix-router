const {expect} = require('chai');
const RadixRouter = require('../index');

describe('Router lookup', () => {
    it('should be able lookup static routes', () => {
        let router = new RadixRouter();
        router.insert('/route', true);
        router.insert('/another-route', true);
        router.insert('/this/is/yet/another/route', true);

        expect(router.lookup('/route')).to.deep.equal({
            path: '/route',
            data: true
        });
        expect(router.lookup('/another-route')).to.deep.equal({
            path: '/another-route',
            data: true
        });
        expect(router.lookup('/this/is/yet/another/route')).to.deep.equal({
            path: '/this/is/yet/another/route',
            data: true
        });
    });

    it('should be able to retrieve placeholders', () => {
        let router = new RadixRouter();
        router.insert('carbon/:element', 14);
        router.insert('carbon/:element/test/:testing', 15);
        router.insert('this/:route/has/:cool/stuff', 16);

        expect(router.lookup('carbon/test1')).to.deep.equal({
            path: 'carbon/test1',
            data: 14,
            params: {
                'element': 'test1'
            }
        });
        expect(router.lookup('carbon/test1')).to.deep.equal({
            path: 'carbon/test1',
            data: 14,
            params: {
                'element': 'test1'
            }
        });
        expect(router.lookup('carbon/test2/test/test23')).to.deep.equal({
            path: 'carbon/test2/test/test23',
            data: 15,
            params: {
                'element': 'test2',
                'testing': 'test23'
            }
        });
        expect(router.lookup('this/test/has/more/stuff')).to.deep.equal({
            path: 'this/test/has/more/stuff',
            data: 16,
            params: {
                route: 'test',
                cool: 'more'
            }
        });
    });

    it('should be able to perform wildcard lookups', () => {
        let router = new RadixRouter();

        router.insert('polymer/**', 12);
        router.insert('polymer/another/route', 13);

        expect(router.lookup('polymer/another/route')).to.deep.equal({
            path: 'polymer/another/route',
            data: 13
        });

        expect(router.lookup('polymer/anon')).to.deep.equal({
            path: 'polymer/anon',
            data: 12
        });

        expect(router.lookup('polymer/2415')).to.deep.equal({
            path: 'polymer/2415',
            data: 12
        });

    });

    it('should be able to match routes with trailing slash', () => {
        let router = new RadixRouter();

        router.insert('route/without/trailing/slash', true);
        router.insert('route/with/trailing/slash/', true);

        expect(router.lookup('route/without/trailing/slash')).to.deep.equal({
            path: 'route/without/trailing/slash',
            data: true
        });

        expect(router.lookup('route/without/trailing/slash/')).to.deep.equal({
            path: 'route/without/trailing/slash/',
            data: true
        });

        expect(router.lookup('route/with/trailing/slash')).to.deep.equal({
            path: 'route/with/trailing/slash',
            data: true
        });

        expect(router.lookup('route/with/trailing/slash/')).to.deep.equal({
            path: 'route/with/trailing/slash/',
            data: true
        });

    });
});
