import { combineResolvers } from 'graphql-resolvers'
import { gql } from 'apollo-server-express'

import * as accountService from '../services/account.service'
import { isAuthenticated, blockEU } from '../utils/graphql.utils'
import { GraphQLContext, CreateAccount } from '../types/app.types'

const AccountType = gql`
  type Account {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
  }
`

const CreateAccountType = gql`
  input CreateAccount {
    username: String!
    password: String!
    firstName: String!
    lastName: String!
  }
`

const createAccount = (_: {}, { account }: { account: CreateAccount }) => accountService.createAccount(account)
const me = (_: {}, __: {}, { token }: GraphQLContext) => accountService.getAccount(token.accountId)

export const types = [AccountType, CreateAccountType]
export const queryResolvers = { me: combineResolvers(isAuthenticated, me) }
export const queries = `
  """
  Get information about the currently logged in account.
  """
  me: Account
`
export const mutationResolvers = {
  createAccount: combineResolvers(blockEU, createAccount),
}
export const mutations = `
  """
  Create a new account.
  """
  createAccount(account: CreateAccount!): Authentication
`
