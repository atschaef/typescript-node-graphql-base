import express, { Request, Response, NextFunction } from 'express'
import { ApolloServer } from 'apollo-server-express'
import bodyParser from 'body-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { defaultTo, pick } from 'lodash/fp'
import { graphqlUploadExpress } from 'graphql-upload'

import routes from './src/routes'
import { config, Environment } from './config'
import myGraphQLSchema from './src/graphql/schema'
import { log } from './src/utils/log.utils'
import Raven, { sentryEnabled } from './src/utils/sentry.utils'
import { AnyObject } from './src/types/app.types'
import { AppError, ForbiddenError, InternalError, NotFoundError, ExternalError } from './src/utils/error.utils'

const app = express()

// Get the user's real IP if using a proxy (e.g. Heroku)
// app.set('trust proxy', true)

if (sentryEnabled()) {
  app.use(Raven.requestHandler())
}

if (config.USE_SSL) {
  app.use(rejectHTTP)
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text({ type: 'text/csv', limit: '1mb' }))

const corsOptions = config.ENV === Environment.Production ? { origin: config.ALLOW_ORIGIN } : {}

app.use(cors(corsOptions))
app.use('/', routes)

const graphQLServer = new ApolloServer({
  ...myGraphQLSchema,
  introspection: true,
  uploads: false,
  context: setGraphQLContext,
  formatError: formatGraphQLError,
})

app.use('/graphql', graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
graphQLServer.applyMiddleware({ app })

if (sentryEnabled()) {
  app.use(Raven.errorHandler())
}

app.use(handle404)
app.use(handleErrors)

export default app

function setGraphQLContext({ req }: { req: Request }) {
  const authorization = defaultTo('', req.header('Authorization'))
  const rawToken = authorization.replace('Bearer ', '')

  return {
    rawToken,
    token: defaultTo({}, jwt.decode(rawToken)),
    headers: {},
    ip: req.ip,
  }
}

function formatGraphQLError(error: AnyObject & { originalError?: Error }) {
  const isUnexpectedError = error.originalError instanceof InternalError || error.originalError instanceof ExternalError
  const isAppError = error.originalError instanceof AppError

  if (sentryEnabled() && error.originalError instanceof Error) {
    if (isUnexpectedError || !isAppError) {
      Raven.captureException(error.originalError!, { extra: { error } })
    } else {
      log.error(error, '[Caught Error]:')
    }
  }

  if (isAppError) {
    delete error.extensions.exception.context
  }

  return error
}

function rejectHTTP(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    const error = new ForbiddenError('SSL is required')

    return res.status(403).send({
      errors: [
        {
          message: error.message,
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            exception: pick<AppError, keyof AppError>(['code', 'msg', 'name'], error),
          },
        },
      ],
    })
  }

  return next()
}

function handle404(req: Request, res: Response, _: NextFunction) {
  log.warn(`No route found for request url: ${req.protocol}://${req.get('host')}${req.originalUrl}`)
  const error = new NotFoundError('Could not find the requested route.')

  return res.status(404).send({
    errors: [
      {
        message: error.message,
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          exception: pick<AppError, keyof AppError>(['code', 'msg', 'name'], error),
        },
      },
    ],
  })
}

function handleErrors(error: AppError, _: Request, res: Response, __: NextFunction) {
  log.error(error, 'ERROR')
  const err = new InternalError('Unknown Error.')

  return res.status(500).send({
    errors: [
      {
        message: err.message,
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          exception: pick<AppError, keyof AppError>(['code', 'msg', 'name'], err),
        },
      },
    ],
  })
}

process.on('unhandledRejection', (err: Error) => {
  log.error(err, 'YOU HAVE AN UNHANDLED REJECTION! FIX IT!!!')
})
