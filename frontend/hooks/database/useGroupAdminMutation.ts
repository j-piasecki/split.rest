import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { Member, SetGroupAdminArguments } from 'shared'

async function setGroupAdmin(
  queryClient: QueryClient,
  groupId: number,
  userId: string,
  admin: boolean
) {
  const args: SetGroupAdminArguments = { groupId, userId, admin }

  await makeRequest('POST', 'setGroupAdmin', args)

  queryClient.setQueryData(['groupMembers', groupId], (oldData: { pages: Member[][] }) => {
    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((member) => (member.id === userId ? { ...member, isAdmin: admin } : member))
      ),
    }
  })
}

export function useSetGroupAdminMutation(groupId: number, userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (admin: boolean) => setGroupAdmin(queryClient, groupId, userId, admin),
  })
}
