import axios from 'axios'
import { expect } from 'chai'
import { createSandbox, SinonStub } from 'sinon'

import { blockEU } from '../../src/utils/graphql.utils'
import { UnavailableForLegalReasons, ExternalError } from '../../src/utils/error.utils'

describe('-- GraphQL utils --', () => {
  const testSandbox = createSandbox()
  const error = new Error('Oops')
  let get: SinonStub

  before(() => {
    get = testSandbox.stub(axios, 'get')
  })

  afterEach(() => {
    testSandbox.resetHistory()
  })

  after(() => {
    testSandbox.restore()
  })

  describe('blockEU', () => {
    const context = { ip: '192.168.0.1', headers: { ['content-type']: 'application/json' }, token: {} }

    it('should block EU IP addresses', async () => {
      get.resolves({ data: { continent_code: 'EU' } })

      try {
        await blockEU({}, {}, context)
        expect.fail(0, 1, 'Everything is not ok because we are NOT in a catch, and this test should throw')
      } catch (err) {
        expect(err).instanceof(UnavailableForLegalReasons)
      }
    })

    it('should return an error if the ip service is down', async () => {
      get.throws(error)

      try {
        await blockEU({}, {}, context)
        expect.fail(0, 1, 'Everything is not ok because we are NOT in a catch, and this test should throw')
      } catch (err) {
        expect(err).instanceof(ExternalError)
      }
    })
  })
})
