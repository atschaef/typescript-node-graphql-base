import request from 'supertest'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import app from '../../app'
import { PingResult } from '../../src/types/app.types'

describe('-- Ping API --', () => {
  it('should return a 200', () =>
    request(app)
      .get('/ping')
      .expect(200)
      .expect(({ body }: { body: PingResult }) => {
        expect(body.version).to.equal(process.env.VERSION)
        expect(body.message).to.equal('pong')
        expect(body.uptime).to.be.a('string')
        expect(body.runningSince)
          .to.be.a('string')
          .and.to.have.length(24)
      }))
})

describe('-- Not Found Route --', () => {
  it('should return a 404', () =>
    request(app)
      .get('/not/a/route')
      .expect(404, {
        errors: [
          {
            message: 'Could not find the requested route.',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              exception: {
                code: 404,
                msg: 'Could not find the requested route.',
                name: 'NotFound',
              },
            },
          },
        ],
      }))
})

describe('-- Authentication --', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  it('should reject if the token exists, but is not valid', () =>
    request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: 'query { me { firstName } }' })
      .expect(200, {
        data: { me: null },
        errors: [
          {
            locations: [{ column: 9, line: 1 }],
            message: 'Your session has expired.',
            path: ['me'],
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              exception: {
                code: 401,
                msg: 'Your session has expired.',
                name: 'Unauthorized',
              },
            },
          },
        ],
      }))

  it('should reject if the token exists, but has no accountId', () => {
    const token = jwt.sign({}, config.TOKEN_SECRET, { expiresIn: config.TOKEN_EXPIRES_IN })

    return request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'query { me { firstName } }',
      })
      .expect(200, {
        data: { me: null },
        errors: [
          {
            locations: [{ column: 9, line: 1 }],
            message: 'Your session has expired.',
            path: ['me'],
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              exception: {
                code: 401,
                msg: 'Your session has expired.',
                name: 'Unauthorized',
              },
            },
          },
        ],
      })
  })
})
