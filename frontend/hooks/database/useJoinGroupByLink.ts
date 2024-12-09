import { useMutation, useQueryClient } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { JoinGroupByLinkArguments } from 'shared'

export function useJoinGroupByLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (uuid: string) => {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to join a group by link')
      }

      const args: JoinGroupByLinkArguments = { uuid }
      await makeRequest('POST', 'joinGroupByLink', args)

      await queryClient.invalidateQueries({ queryKey: ['userGroups', false] })
    },
  })
}
