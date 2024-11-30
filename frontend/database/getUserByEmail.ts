import { makeRequest } from './makeRequest'
import { GetUserByEmailArguments, User } from 'shared'

export async function getUserByEmail(email: string): Promise<User | null> {
  const args: GetUserByEmailArguments = { email }

  try {
    return await makeRequest('GET', 'getUserByEmail', args)
  } catch {
    return null
  }
}
