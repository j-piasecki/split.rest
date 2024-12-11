import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { CreateGroupArguments, GroupInfo, TranslatableError } from 'shared'

async function createGroup(queryClient: QueryClient, args: CreateGroupArguments) {
  const group = await makeRequest<CreateGroupArguments, GroupInfo>('POST', 'createGroup', args)

  if (group === null) {
    throw new TranslatableError('api.group.failedToCreateGroup')
  }

  await queryClient.invalidateQueries({ queryKey: ['userGroups', false] })

  return group
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: CreateGroupArguments) => createGroup(queryClient, args),
  })
}
