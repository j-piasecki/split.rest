import { makeRequest } from './makeRequest'
import { GetUserByEmailArguments, User } from 'shared'

export async function getUserByEmail(email: string): Promise<User | null> {
  const args: GetUserByEmailArguments = { email }

  return await makeRequest('GET', 'getUserByEmail', args)
}
