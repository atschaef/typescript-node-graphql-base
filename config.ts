import * as dotenv from 'dotenv'
import { isEqual } from 'lodash/fp'

dotenv.config()
const isTrue = isEqual('true')

export enum Environment {
  Test = 'test',
  Development = 'development',
  Production = 'production',
}

type Config = {
  DATABASE_URL: string
  DATABASE_DEBUG: boolean
  FRONT_END_URL: string
  ENV: Environment
  PORT: number
  SENTRY_DSN: string
  SHOW_GRAPHIQL: boolean
  STATIC_IP: boolean
  TOKEN_SECRET: string
  TOKEN_EXPIRES_IN: string
  TOKEN_MAX_AGE: string
  USE_SSL: boolean
  VERSION: string
  ALLOW_ORIGIN: Array<string>
}

export const config: Config = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DATABASE_DEBUG: isTrue(process.env.DATABASE_DEBUG!),
  FRONT_END_URL: process.env.FRONT_END_URL!,
  ENV: process.env.NODE_ENV! as Environment,
  PORT: parseInt(process.env.PORT!, 0),
  SENTRY_DSN: process.env.SENTRY_DSN!,
  SHOW_GRAPHIQL: isTrue(process.env.SHOW_GRAPHIQL),
  STATIC_IP: isTrue(process.env.STATIC_IP),
  TOKEN_SECRET: process.env.TOKEN_SECRET!,
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN!,
  TOKEN_MAX_AGE: process.env.TOKEN_MAX_AGE!,
  USE_SSL: isTrue(process.env.USE_SSL),
  VERSION: process.env.VERSION!,
  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN ? process.env.ALLOW_ORIGIN.split(',') : [],
}
