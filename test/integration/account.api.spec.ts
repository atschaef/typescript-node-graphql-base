import request from 'supertest'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import { pick, keys } from 'lodash/fp'
import { config } from '../../config'
import app from '../../app'
import { accounts } from '../../src/database/data'
import { AuthToken, Account, CreateAccount } from '../../src/types/app.types'
import { AccountFields } from '../data/graphql.data'

describe('-- Account API --', () => {
  describe('MUTATION createAccount', () => {
    const fields = `{ token account { ${AccountFields} } }`
    const account = {
      password: 'unbowed unbent unbroken',
      username: 'red.viper@unself.com',
      firstName: 'Oberyn',
      lastName: 'Martell',
    }

    it('should return a token if successful account creation', () =>
      request(app)
        .post('/graphql')
        .send({
          query: `mutation($account: CreateAccount!) { createAccount(account: $account) ${fields} }`,
          variables: { account },
        })
        .expect(({ body }: any) => {
          expect(pick(['data.createAccount.account'], body)).to.deep.equal({
            data: {
              createAccount: {
                account: {
                  id: '3',
                  ...pick<CreateAccount, keyof CreateAccount>(['username', 'firstName', 'lastName'], account),
                },
              },
            },
          })

          const payload = jwt.decode(body.data.createAccount.token) as AuthToken
          expect(keys(payload)).to.have.members(['iat', 'exp', 'accountId'])
        })
        .expect(200))
  })

  describe('QUERY me', () => {
    const fields = `{ ${AccountFields} }`

    it('should return the currently logged in account', () => {
      const token = jwt.sign({ accountId: accounts[0].id }, config.TOKEN_SECRET, { expiresIn: config.TOKEN_EXPIRES_IN })

      return request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `query { me ${fields} }`,
        })
        .expect(200, {
          data: {
            me: pick<Account, keyof Account>(['id', 'username', 'firstName', 'lastName'], accounts[0]),
          },
        })
    })

    it('should return an error if account is not found', () => {
      const token = jwt.sign({ accountId: '4' }, config.TOKEN_SECRET, { expiresIn: config.TOKEN_EXPIRES_IN })

      return request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query: `query { me ${fields} }`,
        })
        .expect(200, {
          data: { me: null },
          errors: [
            {
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                exception: {
                  code: 404,
                  msg: 'Oops, we could not find the account you requested.',
                  name: 'NotFound',
                },
              },
              locations: [{ column: 9, line: 1 }],
              message: 'Oops, we could not find the account you requested.',
              path: ['me'],
            },
          ],
        })
    })

    it('should return an error if there is no token', () =>
      request(app)
        .post('/graphql')
        .send({ query: `query { me ${fields} }` })
        .expect(200, {
          data: { me: null },
          errors: [
            {
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                exception: {
                  code: 401,
                  msg: 'No authorization token was found.',
                  name: 'Unauthorized',
                },
              },
              locations: [{ column: 9, line: 1 }],
              message: 'No authorization token was found.',
              path: ['me'],
            },
          ],
        }))
  })
})
