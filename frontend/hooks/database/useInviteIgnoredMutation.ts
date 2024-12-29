import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupInvites } from '@utils/queryClient'
import { SetGroupInviteIgnoredArguments } from 'shared'

async function setInviteIgnored(groupId: number, ignored: boolean) {
  const args: SetGroupInviteIgnoredArguments = { groupId, ignored }

  await makeRequest('POST', 'setGroupInviteIgnored', args)

  await invalidateGroupInvites()
}

export function useSetInviteIgnoredMutation(groupId: number) {
  return useMutation({
    mutationFn: (ignored: boolean) => setInviteIgnored(groupId, ignored),
  })
}
