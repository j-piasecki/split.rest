import { canQuickRestoreSplit } from '../utils/canQuickRestoreSplit'
import {
  canUserCompleteSplitEntry,
  canUserUncompleteSplitEntry,
} from '../utils/canUserCompleteSplitEntry'
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
            return 'api.group.callerNotInGroup'
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

        case 'querySplits': {
          if (!callerPermissions?.canQuerySplits()) {
            return 'api.insufficientPermissions.group.querySplits'
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

        case 'completeSplitEntry': {
          const args = unsafeArgs as PermissionArguments<['completeSplitEntry']>
          if (!callerPermissions?.canCompleteSplitEntry()) {
            return 'api.insufficientPermissions.group.completeSplitEntry'
          }

          if (!(await canUserCompleteSplitEntry(client, args.splitId, args.userId, callerId))) {
            return 'api.split.callerCannotCompleteEntry'
          }
          continue
        }

        case 'uncompleteSplitEntry': {
          const args = unsafeArgs as PermissionArguments<['uncompleteSplitEntry']>
          if (!callerPermissions?.canUncompleteSplitEntry()) {
            return 'api.insufficientPermissions.group.uncompleteSplitEntry'
          }

          if (!(await canUserUncompleteSplitEntry(client, args.splitId, args.userId, callerId))) {
            return 'api.split.callerCannotUncompleteEntry'
          }
          continue
        }

        case 'resolveDelayedSplits': {
          const args = unsafeArgs as PermissionArguments<['resolveDelayedSplits']>
          const canResolveDelayedSplits = callerPermissions?.canResolveDelayedSplits()
          if (
            canResolveDelayedSplits === undefined ||
            canResolveDelayedSplits === SplitPermissionType.None
          ) {
            return 'api.insufficientPermissions.group.resolveDelayedSplits'
          }

          if (
            canResolveDelayedSplits === SplitPermissionType.OnlyIfIncluded &&
            !(await isUserMemberOfSplit(client, args.splitId, callerId))
          ) {
            return 'api.insufficientPermissions.group.resolveDelayedSplits'
          }
          continue
        }

        case 'resolveAllDelayedSplitsAtOnce': {
          if (!callerPermissions?.canResolveAllDelayedSplitsAtOnce()) {
            return 'api.insufficientPermissions.group.resolveAllDelayedSplitsAtOnce'
          }
          continue
        }

        case 'accessRoulette': {
          if (!callerPermissions?.canAccessRoulette()) {
            return 'api.insufficientPermissions.group.accessRoulette'
          }
          continue
        }

        case 'settleUp': {
          if (!callerPermissions?.canSettleUp()) {
            return 'api.insufficientPermissions.group.settleUp'
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
            return 'api.insufficientPermissions.group.inviteMembers'
          }
          continue
        }

        case 'removeMembers': {
          const args = unsafeArgs as PermissionArguments<['removeMembers']>

          if (args.userId !== callerId || !callerPermissions?.canRemoveMembers()) {
            return 'api.insufficientPermissions.group.removeMembers'
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

        case 'manageDirectInvites': {
          const args = unsafeArgs as PermissionArguments<['manageDirectInvites']>
          if (
            !callerPermissions?.canManageAllDirectInvites() &&
            (!callerPermissions?.canManageDirectInvites() || !args.onlyIfCreated)
          ) {
            return 'api.insufficientPermissions.group.manageDirectInvites'
          }

          continue
        }

        case 'manageAllDirectInvites': {
          if (!callerPermissions?.canManageAllDirectInvites()) {
            return 'api.insufficientPermissions.group.manageDirectInvites'
          }
          continue
        }

        case 'changeDisplayName': {
          if (callerPermissions?.canChangeEveryoneDisplayName()) {
            continue
          }

          const args = unsafeArgs as PermissionArguments<['changeDisplayName']>
          if (callerPermissions?.canChangeDisplayName() && args.userId === callerId) {
            continue
          }

          return 'api.insufficientPermissions.group.changeDisplayName'
        }

        case 'lockGroup': {
          if (!callerPermissions?.canLockGroup()) {
            return 'api.insufficientPermissions.group.lockGroup'
          }
          continue
        }

        case 'settleUpGroup': {
          if (!callerPermissions?.canSettleUpGroup()) {
            return 'api.insufficientPermissions.group.settleUpGroup'
          }
          continue
        }

        case 'manageAllowedSplitMethods': {
          if (!callerPermissions?.canManageAllowedSplitMethods()) {
            return 'api.insufficientPermissions.group.manageAllowedSplitMethods'
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
