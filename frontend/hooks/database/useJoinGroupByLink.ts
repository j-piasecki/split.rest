import { useMutation } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups } from '@utils/queryClient'
import { JoinGroupByLinkArguments, TranslatableError } from 'shared'

export function useJoinGroupByLink() {
  return useMutation({
    mutationFn: async (uuid: string) => {
      if (!auth.currentUser) {
        throw new TranslatableError('api.mustBeLoggedIn')
      }

      const args: JoinGroupByLinkArguments = { uuid }
      await makeRequest('POST', 'joinGroupByLink', args)

      await invalidateUserGroups(false)
    },
  })
}
