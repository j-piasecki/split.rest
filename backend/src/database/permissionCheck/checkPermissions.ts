import { canQuickRestoreSplit } from '../utils/canQuickRestoreSplit'
import { getMemberPermissions } from '../utils/getMemberPermissions'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { isUserMemberOfSplit } from '../utils/isUserMemberOfSplit'
import { PermissionArguments, PermissionToFieldMap } from './utils'
import { Pool } from 'pg'
import { LanguageTranslationKey, SplitPermissionType } from 'shared'

export async function checkPermissions<TPermissions extends (keyof PermissionToFieldMap)[]>(
  pool: Pool,
  callerId: string,
  permissions: TPermissions,
  unsafeArgs: PermissionArguments<TPermissions>
): Promise<LanguageTranslationKey | null> {
  const client = await pool.connect()

  try {
    const callerPermissions =
      'groupId' in unsafeArgs
        ? await getMemberPermissions(client, unsafeArgs.groupId as number, callerId)
        : null

    for (const permission of permissions) {
      switch (permission) {
        case 'beGroupMember': {
          const args = unsafeArgs as PermissionArguments<['beGroupMember']>
          if (!(await isUserMemberOfGroup(client, args.groupId, callerId))) {
            return 'api.group.userNotInGroup'
          }
          continue
        }

        case 'createSplit': {
          if (!callerPermissions?.canCreateSplits()) {
            return 'api.insufficientPermissions.group.createSplit'
          }
          continue
        }

        case 'readSplits': {
          const args = unsafeArgs as PermissionArguments<['readSplits']>
          const canReadSplits = callerPermissions?.canReadSplits()
          if (canReadSplits === undefined || canReadSplits === SplitPermissionType.None) {
            return 'api.insufficientPermissions.group.readSplits'
          }

          if (
            canReadSplits === SplitPermissionType.OnlyIfIncluded &&
            args.onlyIfIncluded !== true
          ) {
            return 'api.insufficientPermissions.group.readSplits'
          }
          continue
        }

        case 'seeSplitDetails': {
          const args = unsafeArgs as PermissionArguments<['seeSplitDetails']>
          const canSeeDetails = callerPermissions?.canSeeSplitsDetails()
          if (canSeeDetails === undefined || canSeeDetails === SplitPermissionType.None) {
            return 'api.insufficientPermissions.group.seeSplitDetails'
          }

          if (
            canSeeDetails === SplitPermissionType.OnlyIfIncluded &&
            !(await isUserMemberOfSplit(client, args.splitId, callerId))
          ) {
            return 'api.insufficientPermissions.group.seeSplitDetails'
          }
          continue
        }

        case 'updateSplit': {
          const args = unsafeArgs as PermissionArguments<['updateSplit']>
          const canUpdateSplits = callerPermissions?.canUpdateSplits()
          if (canUpdateSplits === undefined || canUpdateSplits === SplitPermissionType.None) {
            return 'api.insufficientPermissions.group.editSplit'
          }

          if (
            canUpdateSplits === SplitPermissionType.OnlyIfIncluded &&
            !(await isUserMemberOfSplit(client, args.splitId, callerId))
          ) {
            return 'api.insufficientPermissions.group.editSplit'
          }
          continue
        }

        case 'deleteSplit': {
          const args = unsafeArgs as PermissionArguments<['deleteSplit']>
          const canDeleteSplits = callerPermissions?.canDeleteSplits()
          if (canDeleteSplits === undefined || canDeleteSplits === SplitPermissionType.None) {
            return 'api.insufficientPermissions.group.deleteSplit'
          }

          if (
            canDeleteSplits === SplitPermissionType.OnlyIfIncluded &&
            !(await isUserMemberOfSplit(client, args.splitId, callerId))
          ) {
            return 'api.insufficientPermissions.group.deleteSplit'
          }
          continue
        }

        case 'restoreSplit': {
          const args = unsafeArgs as PermissionArguments<['restoreSplit']>
          // Check if the user is trying to restore a split they **just** deleted
          if (await canQuickRestoreSplit(client, args.splitId, callerId)) {
            continue
          }

          const canRestoreSplits = callerPermissions?.canRestoreSplits()
          if (canRestoreSplits === undefined || canRestoreSplits === SplitPermissionType.None) {
            return 'api.insufficientPermissions.group.restoreSplit'
          }

          if (
            canRestoreSplits === SplitPermissionType.OnlyIfIncluded &&
            !(await isUserMemberOfSplit(client, args.splitId, callerId))
          ) {
            return 'api.insufficientPermissions.group.restoreSplit'
          }
          continue
        }

        case 'accessRoulette': {
          if (!callerPermissions?.canAccessRoulette()) {
            return 'api.insufficientPermissions.group.accessRoulette'
          }
          continue
        }

        case 'readMembers': {
          if (!callerPermissions?.canReadMembers()) {
            return 'api.insufficientPermissions.group.readMembers'
          }
          continue
        }

        case 'inviteMembers': {
          if (!callerPermissions?.canInviteMembers()) {
            return 'api.insufficientPermissions.group.addMembers'
          }
          continue
        }

        case 'renameGroup': {
          if (!callerPermissions?.canRenameGroup()) {
            return 'api.insufficientPermissions.group.rename'
          }
          continue
        }

        case 'deleteGroup': {
          if (!callerPermissions?.canDeleteGroup()) {
            return 'api.insufficientPermissions.group.delete'
          }
          continue
        }

        case 'seeJoinLink': {
          if (!callerPermissions?.canSeeJoinLink()) {
            return 'api.insufficientPermissions.group.joinLink.see'
          }
          continue
        }

        case 'createJoinLink': {
          if (!callerPermissions?.canCreateJoinLink()) {
            return 'api.insufficientPermissions.group.joinLink.create'
          }
          continue
        }

        case 'deleteJoinLink': {
          if (!callerPermissions?.canDeleteJoinLink()) {
            return 'api.insufficientPermissions.group.joinLink.delete'
          }
          continue
        }

        case 'manageAccess': {
          if (!callerPermissions?.canManageAccess()) {
            return 'api.insufficientPermissions.group.manageAccess'
          }
          continue
        }

        case 'manageAdmins': {
          if (!callerPermissions?.canManageAdmins()) {
            return 'api.insufficientPermissions.group.manageAdmins'
          }
          continue
        }

        case 'readPermissions': {
          const args = unsafeArgs as PermissionArguments<['readPermissions']>
          if (args.userId && args.userId !== callerId && !callerPermissions?.canReadPermissions()) {
            return 'api.insufficientPermissions.group.readPermissions'
          }
          continue
        }

        case 'managePermissions': {
          if (!callerPermissions?.canManagePermissions()) {
            return 'api.insufficientPermissions.group.managePermissions'
          }
          continue
        }

        default:
          console.log('Unknown permission required:', permission)
          return 'unknownError'
      }
    }
  } finally {
    client.release()
  }

  return null
}
