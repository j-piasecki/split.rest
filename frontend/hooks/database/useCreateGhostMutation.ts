import { useMutation } from '@tanstack/react-query'
import { makeRequest } from '@utils/makeApiRequest'
import { invalidateGroupMembers } from '@utils/queryClient'
import { CreateGhostArguments, Member, TranslatableError } from 'shared'

async function createGhost(groupId: number, name: string) {
  const args: CreateGhostArguments = { groupId, name }

  const response = await makeRequest<CreateGhostArguments, Member>('POST', 'createGhost', args)

  if (!response) {
    throw new TranslatableError('api.group.failedToCreateGhost')
  }

  await invalidateGroupMembers(groupId)

  return response
}

export function useCreateGhostMutation(groupId: number) {
  return useMutation({
    mutationFn: (name: string) => createGhost(groupId, name),
  })
}
