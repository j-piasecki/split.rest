import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups } from '@utils/queryClient'
import { JoinGroupByLinkArguments } from 'shared'

export function useJoinGroupByLink() {
  return useMutation({
    mutationFn: async (uuid: string) => {

      const args: JoinGroupByLinkArguments = { uuid }
      await makeRequest('POST', 'joinGroupByLink', args)

      await invalidateUserGroups(false)
    },
  })
}
