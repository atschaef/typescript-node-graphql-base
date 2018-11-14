import { gql } from 'apollo-server-express'
import { GraphQLUpload } from 'graphql-upload'

import * as AuthGraphQL from './auth.graphql'
import * as UserGraphQL from './account.graphql'

const SchemaDefinition = gql`
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`

const RootQueryType = gql`
  type RootQuery {
    ${UserGraphQL.queries}
    ${AuthGraphQL.queries}
  }
`

const RootMutationType = gql`
  type RootMutation {
    ${UserGraphQL.mutations}
  }
`

const ScalarTypes = gql`
  scalar Upload
`

const ResultType = gql`
  """
  A generic representation of updates and deletes through the API.
  """
  type Result {
    success: Boolean!
    count: Int!
    added: Int
    removed: Int
    updated: Int
    ignored: Int
    ignoredReasons: [String!]
  }
`

const rootResolvers = {
  RootQuery: {
    ...UserGraphQL.queryResolvers,
    ...AuthGraphQL.queryResolvers,
  },
  RootMutation: {
    ...UserGraphQL.mutationResolvers,
  },
}

const types = [ScalarTypes, ResultType, ...AuthGraphQL.types, ...UserGraphQL.types]

export default {
  typeDefs: [SchemaDefinition, RootQueryType, RootMutationType, ...types],
  resolvers: {
    ...rootResolvers,
    Upload: GraphQLUpload,
  },
}
