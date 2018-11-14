import { accounts } from '../database/data'
import { NotFoundError } from '../utils/error.utils'
import { CreateAccount } from '../types/app.types'
import { createToken } from '../utils/auth.utils'

export const createAccount = async (createAccount: CreateAccount) => {
  const account = {
    id: accounts.length + 1,
    username: createAccount.username,
    firstName: createAccount.firstName,
    lastName: createAccount.lastName,
  }

  return { account, token: createToken(account.id) }
}

export const getAccount = async (accountId: string) => {
  const account = await accounts.find((account) => account.id === accountId)
  if (!account) {
    throw new NotFoundError('Oops, we could not find the account you requested.')
  }

  return account
}
