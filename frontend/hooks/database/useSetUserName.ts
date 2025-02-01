import { useMutation } from '@tanstack/react-query'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserById } from '@utils/queryClient'
import { SetUserNameArguments } from 'shared'

async function setUserName(name: string) {
  const args: SetUserNameArguments = { name }

  await makeRequest('POST', 'setUserName', args)
  await invalidateUserById(auth.currentUser?.uid)
}

export function useSetUserNameMutation() {
  return useMutation({
    mutationFn: (name: string) => setUserName(name),
  })
}
