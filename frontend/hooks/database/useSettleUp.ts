import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'
import { SettleUpArguments, SplitInfo, TranslatableError } from 'shared'

async function settleUp(groupId?: number): Promise<SplitInfo> {
  if (!groupId) {
    throw new TranslatableError('api.notFound.group')
  }

  const args: SettleUpArguments = { groupId }
  const splitInfo = await makeRequest<SettleUpArguments, SplitInfo>('POST', 'settleUp', args)

  if (!splitInfo) {
    throw new TranslatableError('api.split.settleUpFailed')
  }

  await invalidateGroup(args.groupId)

  return splitInfo
}

export function useSettleUp() {
  return useMutation({
    mutationFn: (groupId?: number) => settleUp(groupId),
  })
}
