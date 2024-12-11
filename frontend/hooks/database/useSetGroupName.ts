import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GroupInfo, SetGroupNameArguments } from 'shared'

async function setGroupName(queryClient: QueryClient, groupId: number, name: string) {
  const args: SetGroupNameArguments = { groupId, name }

  await makeRequest('POST', 'setGroupName', args)

  await queryClient.invalidateQueries({ queryKey: ['userGroups'] })
  await queryClient.setQueryData(['groupInfo', groupId], (oldData?: GroupInfo) => {
    if (!oldData) {
      return
    }
    return { ...oldData, name }
  })
}

export function useSetGroupNameMutation(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => setGroupName(queryClient, groupId, name),
  })
}
