import { makeRequest } from '../utils/makeApiRequest'
import { GetBalancesArguments, UserWithBalanceChange } from 'shared'

export async function getBalances(
  groupId: number,
  emails: string[]
): Promise<UserWithBalanceChange[]> {
  const args: GetBalancesArguments = { groupId, emails }

  try {
    return (await makeRequest('GET', 'getBalances', args)) ?? []
  } catch (e) {
    console.error(e)
    return []
  }
}
