import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroup } from '@utils/queryClient'
import { SettleUpGroupArguments } from 'shared'

async function settleUpGroup(groupId: number | undefined) {
  if (groupId === undefined) {
    console.error('Tried to settle up group with undefined groupId')
    return
  }

  const args: SettleUpGroupArguments = { groupId }

  await makeRequest('POST', 'settleUpGroup', args)

  await invalidateGroup(groupId)
}

export function useSettleUpGroup(groupId: number | undefined) {
  return useMutation({
    mutationFn: () => settleUpGroup(groupId),
  })
}
