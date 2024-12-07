import { makeRequest } from '../utils/makeApiRequest'
import { GetUserByIdArguments, User } from 'shared'

export async function getUserById(id: string): Promise<User | null> {
  const args: GetUserByIdArguments = { userId: id }

  try {
    return await makeRequest('GET', 'getUserById', args)
  } catch {
    return null
  }
}
