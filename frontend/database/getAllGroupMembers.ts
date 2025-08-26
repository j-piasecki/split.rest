import { makeRequest } from '@utils/makeApiRequest'
import { GetGroupMembersArguments, Member, TranslatableError } from 'shared'

export async function getAllGroupMembers(groupId: number): Promise<Member[]> {
  let nextPageParam: string | undefined = undefined
  const members: Member[] = []

  while (true) {
    const result: Member[] | null = await makeRequest<GetGroupMembersArguments, Member[]>(
      'GET',
      'getGroupMembers',
      { groupId, startAfter: nextPageParam }
    )

    if (!result) {
      throw new TranslatableError('api.group.cannotReadAllMembers')
    }

    members.push(...result)

    if (result.length === 0) {
      break
    }

    nextPageParam = result[result.length - 1].id
  }

  return members
}
