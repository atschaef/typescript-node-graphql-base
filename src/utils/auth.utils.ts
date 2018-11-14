import jwt from 'jsonwebtoken'
import { config } from '../../config'

export const createToken = (accountId: number) =>
  jwt.sign({ accountId }, config.TOKEN_SECRET, { expiresIn: config.TOKEN_EXPIRES_IN })
