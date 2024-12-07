import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GroupInfo, SetGroupNameArguments } from 'shared'

async function setGroupName(queryClient: QueryClient, groupId: number, name: string) {
  const args: SetGroupNameArguments = { groupId, name }

  await makeRequest('POST', 'setGroupName', args)

  queryClient.setQueryData(['groupInfo', groupId], (oldData: GroupInfo) => {
    return { ...oldData, name }
  })
}

export function useSetGroupNameMutation(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => setGroupName(queryClient, groupId, name),
  })
}
