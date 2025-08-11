import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'
import { ConfirmSettleUpArguments, SplitInfo } from 'shared'

async function confirmSettleUp(
  groupId: number,
  hash: string,
  withMembers?: string[],
  amounts?: string[]
) {
  const args: ConfirmSettleUpArguments = { groupId, entriesHash: hash, withMembers, amounts }

  const split = await makeRequest<ConfirmSettleUpArguments, SplitInfo>(
    'POST',
    'confirmSettleUp',
    args
  )
  await invalidateGroup(groupId)

  return split
}

export function useConfirmSettleUpMutation(
  groupId: number,
  withMembers?: string[],
  amounts?: string[]
) {
  return useMutation({
    mutationFn: (hash: string) => confirmSettleUp(groupId, hash, withMembers, amounts),
  })
}
