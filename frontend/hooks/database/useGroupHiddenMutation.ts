import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { GroupInfo, SetGroupHiddenArguments } from 'shared'

async function setGroupHidden(queryClient: QueryClient, groupId: number, hidden: boolean) {
  const args: SetGroupHiddenArguments = { groupId, hidden }

  await makeRequest('POST', 'setGroupHidden', args)

  await queryClient.setQueryData(['groupInfo', groupId], (oldData?: GroupInfo) => {
    if (!oldData) {
      return
    }

    return { ...oldData, hidden }
  })

  await queryClient.invalidateQueries({ queryKey: ['userGroups'] })
}

export function useSetGroupHiddenMutation(groupId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hidden: boolean) => setGroupHidden(queryClient, groupId, hidden),
  })
}
