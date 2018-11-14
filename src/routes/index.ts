import express, { Response, Request } from 'express'
import { DateTime } from 'luxon'

import { config } from '../../config'

const router = express.Router()
const runningSince = DateTime.utc()

router.get('/ping', (_: Request, res: Response) => {
  const { days, hours, minutes, seconds, milliseconds } = DateTime.utc().diff(runningSince)

  res.send({
    runningSince,
    version: config.VERSION,
    message: 'pong',
    uptime: `${days} days ${hours} hours ${minutes} minutes ${seconds}.${milliseconds} seconds`,
  })
})

export default router
