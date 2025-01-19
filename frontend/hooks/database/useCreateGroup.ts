import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateUserGroups } from '@utils/queryClient'
import { CreateGroupArguments, GroupUserInfo, TranslatableError } from 'shared'

async function createGroup(args: CreateGroupArguments) {
  const group = await makeRequest<CreateGroupArguments, GroupUserInfo>('POST', 'createGroup', args)

  if (group === null) {
    throw new TranslatableError('api.group.failedToCreateGroup')
  }

  await invalidateUserGroups(false)

  return group
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: (args: CreateGroupArguments) => createGroup(args),
  })
}
