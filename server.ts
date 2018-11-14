import http from 'http'
import devIp from 'dev-ip'
import { noop } from 'lodash'

import app from './app'
import { config, Environment } from './config'
import { log } from './src/utils/log.utils'

const hostname = (config.STATIC_IP && config.ENV === Environment.Development && devIp()[0]) || undefined

app.set('port', config.PORT)

const server = http.createServer(app)

server.on('error', onError)
server.on('listening', onListening)
// TODO: Figure out why TS chooses the wrong overload here
server.listen(config.PORT, hostname, noop)

function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(`${config.PORT} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      log.error(`${config.PORT} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening() {
  log.info(`Listening at: ${hostname || 'localhost'}:${config.PORT}`)
}
