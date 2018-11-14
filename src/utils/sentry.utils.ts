import Raven from 'raven'

import { config } from '../../config'

export const sentryEnabled = () => !!config.SENTRY_DSN

if (sentryEnabled()) {
  Raven.config(config.SENTRY_DSN!, {
    environment: config.ENV,
    release: config.VERSION,
  }).install()
}

export default Raven
