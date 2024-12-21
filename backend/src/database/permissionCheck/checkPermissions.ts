import { hasAccessToGroup } from '../utils/hasAccessToGroup'
import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { isUserGroupOwner } from '../utils/isUserGroupOwner'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { PermissionArguments, PermissionToFieldMap } from './permissions'
import { Pool } from 'pg'
import { LanguageTranslationKey } from 'shared'

export async function checkPermissions<TPermissions extends (keyof PermissionToFieldMap)[]>(
  pool: Pool,
  callerId: string,
  permissions: TPermissions,
  unsafeArgs: PermissionArguments<TPermissions>
): Promise<LanguageTranslationKey | null> {
  for (const permission of permissions) {
    const args = unsafeArgs as PermissionArguments<[typeof permission]>

    switch (permission) {
      case 'accessGroup':
        if (!(await hasAccessToGroup(pool, args.groupId, callerId))) {
          return 'api.insufficientPermissions.group.access'
        }
        return null

      case 'manageGroup':
        if (!(await isUserGroupAdmin(pool, args.groupId, callerId))) {
          return 'api.insufficientPermissions.group.manage'
        }
        return null

      case 'deleteSplit':
      case 'restoreSplit':
      case 'editSplit':
        if (await isUserGroupAdmin(pool, args.groupId, callerId)) {
          return null
        }

        const splitInfo = (
          await pool.query<{ paid_by: string; created_by: string; total: string }>(
            'SELECT paid_by, created_by, total FROM splits WHERE group_id = $1 AND id = $2',
            [args.groupId, args.splitId]
          )
        ).rows[0]

        if (splitInfo && splitInfo.created_by !== callerId && splitInfo.paid_by !== callerId) {
          return `api.insufficientPermissions.group.${permission}`
        }

        return null

      case 'beGroupMember':
        if (!(await isUserMemberOfGroup(pool, args.groupId, callerId))) {
          return 'api.group.userNotInGroup'
        }
        return null

      case 'deleteGroup':
        if (!(await isUserGroupOwner(pool, args.groupId, callerId))) {
          return 'api.insufficientPermissions.group.delete'
        }
        return null

      default:
        console.log('Unknown permission required:', permission)
        return 'unknownError'
    }
  }
}
