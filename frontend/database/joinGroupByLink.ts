import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { JoinGroupByLinkArguments } from 'shared'

export async function joinGroupByLink(uuid: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to join a group by link')
  }

  const args: JoinGroupByLinkArguments = { uuid }
  return makeRequest('POST', 'joinGroupByLink', args)
}

