import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupInvites } from '@utils/queryClient'
import { SetGroupInviteRejectedArguments } from 'shared'

async function setInviteRejected(groupId: number, rejected: boolean) {
  const args: SetGroupInviteRejectedArguments = { groupId, rejected }

  await makeRequest('POST', 'setGroupInviteRejected', args)

  await invalidateGroupInvites()
}

export function useSetInviteRejectedMutation(groupId: number) {
  return useMutation({
    mutationFn: (ignored: boolean) => setInviteRejected(groupId, ignored),
  })
}
