import { makeRequest } from '../utils/makeApiRequest'
import * as Localization from 'expo-localization'
import { RegisterOrUpdateNotificationTokenArguments } from 'shared'

export async function registerOrUpdateNotificationToken(token: string): Promise<void> {
  const args: RegisterOrUpdateNotificationTokenArguments = {
    token,
    language: Localization.getLocales()[0].languageCode ?? 'en',
  }

  try {
    await makeRequest('POST', 'registerOrUpdateNotificationToken', args)
  } catch (e) {
    console.error(e)
  }
}
