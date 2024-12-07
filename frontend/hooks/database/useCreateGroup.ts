import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { CreateGroupArguments } from 'shared'

async function createGroup(queryClient: QueryClient, args: CreateGroupArguments) {
  const groupId = await makeRequest<CreateGroupArguments, number>('POST', 'createGroup', args)

  if (groupId === null) {
    throw new Error('Failed to create group')
  }

  queryClient.invalidateQueries({ queryKey: ['userGroups', false] })

  return groupId
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: CreateGroupArguments) => createGroup(queryClient, args),
  })
}
