import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { SetUserNameArguments } from 'shared'

async function setUserName(name: string) {
  const args: SetUserNameArguments = { name }

  await makeRequest('POST', 'setUserName', args)
}

export function useSetUserNameMutation() {
  return useMutation({
    mutationFn: (name: string) => setUserName(name),
  })
}
