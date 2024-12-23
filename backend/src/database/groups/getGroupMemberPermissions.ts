import { NotFoundException } from '../../errors/NotFoundException'
import { getMemberPermissions } from '../utils/getMemberPermissions'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetGroupMemberPermissionsArguments, GroupMemberPermissionsDTO } from 'shared'

export async function getGroupMemberPermissions(
  pool: Pool,
  callerId: string,
  args: GetGroupMemberPermissionsArguments
): Promise<GroupMemberPermissionsDTO> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const permissions = await getMemberPermissions(pool, args.groupId, args.userId ?? callerId)

  if (permissions === null) {
    throw new NotFoundException('api.notFound.user')
  }

  return permissions
}
