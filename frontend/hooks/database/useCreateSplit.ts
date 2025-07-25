import { useMutation } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { addCachedSplit, invalidateSplitRelatedQueries } from '@utils/queryClient'
import { CreateSplitArguments } from 'shared'

export async function createSplit(args: CreateSplitArguments) {
  const splitId = await makeRequest<CreateSplitArguments, number>('POST', 'createSplit', args)

  await addCachedSplit(args.groupId, {
    ...args,
    id: splitId!,
    version: 1,
    createdById: auth.currentUser!.uid,
    paidById: args.paidBy,
    updatedAt: Date.now(),
    total: String(args.total),
    type: args.type,
    isUserParticipating: true,
    pending: false,
  })

  await invalidateSplitRelatedQueries(args.groupId, splitId ?? -1)
}

export function useCreateSplit() {
  return useMutation({
    mutationFn: (args: CreateSplitArguments) => createSplit(args),
  })
}
