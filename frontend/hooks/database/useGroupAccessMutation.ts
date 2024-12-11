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

  await queryClient.setQueryData(['groupMembers', groupId], (oldData?: { pages: Member[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((member) => {
          if (member.id === userId) {
            if (access) {
              return { ...member, hasAccess: true }
            } else {
              return { ...member, hasAccess: false, isAdmin: false }
            }
          }

          return member
        })
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
