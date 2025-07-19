import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'
import { SettleUpGroupArguments } from 'shared'

async function settleUpGroup(groupId: number) {
  const args: SettleUpGroupArguments = { groupId }

  await makeRequest('POST', 'settleUpGroup', args)

  await invalidateGroup(groupId)
}

export function useSettleUpGroup(groupId: number) {
  return useMutation({
    mutationFn: () => settleUpGroup(groupId),
  })
}
