import { makeRequest } from '../utils/makeApiRequest'
import { UnregisterNotificationTokenArguments } from 'shared'

export async function unregisterNotificationToken(token: string): Promise<void> {
  const args: UnregisterNotificationTokenArguments = {
    token,
  }

  try {
    await makeRequest('POST', 'unregisterNotificationToken', args)
  } catch (e) {
    console.error(e)
  }
}
