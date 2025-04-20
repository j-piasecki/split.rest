import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateSplitRelatedQueries } from '@utils/queryClient'
import { CompleteSplitEntryArguments } from 'shared'

async function uncompleteSplitEntry(
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

  await makeRequest('POST', 'uncompleteSplitEntry', args)
  await invalidateSplitRelatedQueries(groupId, splitId)
}

export function useUncompleteSplitEntryMutation(groupId?: number, splitId?: number) {
  return useMutation({
    mutationFn: (userId: string) => uncompleteSplitEntry(groupId, splitId, userId),
  })
}
