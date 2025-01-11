import { makeRequest } from '../utils/makeApiRequest'
import { GetBalancesArguments, UserWithBalanceChange } from 'shared'

export async function getBalances(
  groupId: number,
  ids: string[]
): Promise<UserWithBalanceChange[]> {
  const args: GetBalancesArguments = { groupId, users: ids }

  try {
    return (await makeRequest('GET', 'getBalances', args)) ?? []
  } catch (e) {
    console.error(e)
    return []
  }
}
