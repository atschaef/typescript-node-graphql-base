import { combineResolvers } from 'graphql-resolvers'
import { gql } from 'apollo-server-express'

import { Credential } from '../types/app.types'
import * as authService from '../services/auth.service'
import { blockEU } from '../utils/graphql.utils'

const AuthenticationType = gql`
  type Authentication {
    token: String!
    account: Account!
  }
`

const CredentialInput = gql`
  """
  Login via username and password
  """
  input Credentials {
    username: String!
    password: String!
  }
`

const login = async (_: {}, { credentials }: { credentials: Credential }) => authService.login(credentials)

export const types = [AuthenticationType, CredentialInput]

export const queries = `
  """
  Sign in a user and get their authentication token
  """
  login(credentials: Credentials): Authentication
`

export const queryResolvers = {
  login: combineResolvers(blockEU, login),
}

export const mutationResolvers = {}

export const mutations = ``
