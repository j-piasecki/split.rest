import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateSplitRelatedQueries } from '@utils/queryClient'
import { CompleteSplitEntryArguments } from 'shared'

async function completeSplitEntry(
  groupId: number | undefined,
  splitId: number | undefined,
  userId: string
) {
  if (groupId === undefined) {
    throw new Error('groupId must be defined')
  }

  if (splitId === undefined) {
    throw new Error('splitId must be defined')
  }

  const args: CompleteSplitEntryArguments = { groupId, splitId, userId }

  await makeRequest('POST', 'completeSplitEntry', args)
  await invalidateSplitRelatedQueries(groupId, splitId)
}

export function useCompleteSplitEntryMutation(groupId?: number, splitId?: number) {
  return useMutation({
    mutationFn: (userId: string) => completeSplitEntry(groupId, splitId, userId),
  })
}
