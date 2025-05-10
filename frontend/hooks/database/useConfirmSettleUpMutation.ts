import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'
import { ConfirmSettleUpArguments } from 'shared'

async function confirmSettleUp(groupId: number, hash: string, withMembers?: string[]) {
  const args: ConfirmSettleUpArguments = { groupId, entriesHash: hash, withMembers }

  await makeRequest('POST', 'confirmSettleUp', args)
  await invalidateGroup(groupId)
}

export function useConfirmSettleUpMutation(groupId: number, withMembers?: string[]) {
  return useMutation({
    mutationFn: (hash: string) => confirmSettleUp(groupId, hash, withMembers),
  })
}
