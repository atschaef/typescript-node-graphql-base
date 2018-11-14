import request from 'supertest'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import { pick, keys } from 'lodash/fp'

import app from '../../app'
import { AuthToken } from '../../src/types/app.types'
import { AccountFields } from '../data/graphql.data'
import { accounts, credentials } from '../../src/database/data'

describe('-- Auth API --', () => {
  describe('QUERY login', () => {
    const fields = `{ token account { ${AccountFields} } }`

    it('should return a token if successful login', () =>
      request(app)
        .post('/graphql')
        .send({
          query: `query($credentials: Credentials) { login(credentials: $credentials) ${fields} }`,
          variables: {
            credentials: {
              password: credentials.Malcolm.password,
              username: credentials.Malcolm.username,
            },
          },
        })
        .expect(({ body }: any) => {
          expect(pick(['data.login.account'], body)).to.deep.equal({
            data: {
              login: {
                account: pick(['id', 'username', 'firstName', 'lastName'], accounts[0]),
              },
            },
          })

          const payload = jwt.decode(body.data.login.token) as AuthToken
          expect(keys(payload)).to.have.members(['iat', 'exp', 'accountId'])
          expect(pick<AuthToken, keyof AuthToken>(['accountId'], payload)).to.deep.equal({ accountId: accounts[0].id })
        })
        .expect(200))

    it('should return an error if the account doesn’t exit', () =>
      request(app)
        .post('/graphql')
        .send({
          query: `query($credentials: Credentials) { login(credentials: $credentials) ${fields} }`,
          variables: {
            credentials: {
              password: credentials.Malcolm.password,
              username: 'cayde6@example.com',
            },
          },
        })
        .expect(200, {
          data: { login: null },
          errors: [
            {
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                exception: {
                  code: 400,
                  msg: 'Unknown username or password.',
                  name: 'BadRequest',
                },
              },
              locations: [{ column: 36, line: 1 }],
              message: 'Unknown username or password.',
              path: ['login'],
            },
          ],
        }))

    it('should return an error if an invalid password is provided', () =>
      request(app)
        .post('/graphql')
        .send({
          query: `query($credentials: Credentials) { login(credentials: $credentials) ${fields} }`,
          variables: {
            credentials: {
              password: credentials.Wash.password,
              username: credentials.Malcolm.username,
            },
          },
        })
        .expect(200, {
          data: { login: null },
          errors: [
            {
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                exception: {
                  code: 400,
                  msg: 'Unknown username or password.',
                  name: 'BadRequest',
                },
              },
              locations: [{ column: 36, line: 1 }],
              message: 'Unknown username or password.',
              path: ['login'],
            },
          ],
        }))
  })
})
