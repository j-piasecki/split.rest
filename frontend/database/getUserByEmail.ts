import { GetUserByEmailArguments, User } from 'shared'
import { makeRequest } from './makeRequest'

export async function getUserByEmail(email: string): Promise<User | null> {
  const args: GetUserByEmailArguments = { email }
  
  return await makeRequest('GET', 'getUserByEmail', args)
}
