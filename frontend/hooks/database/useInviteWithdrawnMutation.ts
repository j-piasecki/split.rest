import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateDirectGroupInvites } from '@utils/queryClient'
import { SetGroupInviteWithdrawnArguments } from 'shared'

async function setInviteWithdrawn(groupId: number, userId: string, withdrawn: boolean, onlyIfCreated?: boolean) {
  const args: SetGroupInviteWithdrawnArguments = { groupId, userId, withdrawn, onlyIfCreated }

  await makeRequest('POST', 'setGroupInviteWithdrawn', args)

  await invalidateDirectGroupInvites(groupId)
}

export function useSetInviteWithdrawnMutation(groupId: number, userId: string) {
  return useMutation({
    mutationFn: (withdrawn: boolean, onlyIfCreated?: boolean) => setInviteWithdrawn(groupId, userId, withdrawn, onlyIfCreated),
  })
}
