import bcrypt from 'bcrypt'
import { accounts } from '../database/data'
import { UnauthorizedError, BadRequestError, NotFoundError } from '../utils/error.utils'
import { Credential } from '../types/app.types'
import { createToken } from '../utils/auth.utils'

export const login = async ({ username, password }: Credential) => {
  try {
    const account = await accounts.find((account) => account.username === username)

    if (!account) {
      throw new NotFoundError('Could not find account')
    }

    await validatePassword(password, account.password!)

    return { account, token: createToken(account.id) }
  } catch (err) {
    throw new BadRequestError('Unknown username or password.', err)
  }
}

async function validatePassword(password: string, dbPassword: string) {
  const success = await bcrypt.compare(password, dbPassword)

  if (!success) {
    throw new UnauthorizedError('Invalid credentials provided.')
  }
}
