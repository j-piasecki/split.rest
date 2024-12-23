import { useQuery } from '@tanstack/react-query'
import { GroupPermissions } from '@utils/GroupPermissions'
import { auth } from '@utils/firebase'
import { makeRequest } from '@utils/makeApiRequest'
import {
  GetGroupMemberPermissionsArguments,
  GroupMemberPermissionsDTO,
  TranslatableError,
} from 'shared'

export function useGroupPermissions(groupId?: number, userId?: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get group info')
  }

  return useQuery({
    queryKey: ['groupPermissions', groupId, userId],
    queryFn: async (): Promise<GroupPermissions> => {
      if (!groupId) {
        throw new TranslatableError('api.notFound.group')
      }

      const args: GetGroupMemberPermissionsArguments = { groupId: groupId, userId: userId }
      const info = await makeRequest<GetGroupMemberPermissionsArguments, GroupMemberPermissionsDTO>(
        'GET',
        'getGroupMemberPermissions',
        args
      )

      if (info === null) {
        throw new TranslatableError('api.notFound.group')
      }

      return new GroupPermissions(info.splits, info.members, info.manage)
    },
  })
}
