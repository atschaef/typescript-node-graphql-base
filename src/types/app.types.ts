import { GraphQLResolveInfo } from 'graphql'
import { MergeInfo } from 'graphql-tools'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type AnyObject = { [key: string]: any }

export type GraphQLContext = {
  token: AuthToken
  rawToken?: string
  headers: Headers
  ip: string
}

export type GraphQLInfo = GraphQLResolveInfo & { mergeInfo: MergeInfo }

export type Headers = AnyObject & {
  ['content-type']: string
  authorization?: string
}

export type PingResult = {
  version: string
  message: string
  uptime: string
  runningSince: string
}

export type AuthToken = { accountId: string; iat: number; exp: number }

export type Credential = {
  username: string
  password: string
}

export type Account = {
  id: string
  username: string
  firstName: string
  lastName: string
}

export type CreateAccount = {
  username: string
  password: string
  firstName: string
  lastName: string
}
