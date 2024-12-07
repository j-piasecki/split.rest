import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { Member, SetGroupAccessArguments } from 'shared'

async function setGroupAccess(
  queryClient: QueryClient,
  groupId: number,
  userId: string,
  access: boolean
) {
  const args: SetGroupAccessArguments = { groupId, userId, access }

  await makeRequest('POST', 'setGroupAccess', args)

  queryClient.setQueryData(['groupMembers', groupId], (oldData: { pages: Member[][] }) => {
    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((member) => (member.id === userId ? { ...member, hasAccess: access } : member))
      ),
    }
  })
}

export function useSetGroupAccessMutation(groupId: number, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (access: boolean) => setGroupAccess(queryClient, groupId, userId, access),
  })
}
