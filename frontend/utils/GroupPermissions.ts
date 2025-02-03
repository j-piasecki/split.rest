import { auth } from './firebase'
import { GroupMemberPermissions, SplitInfo, SplitPermissionType, SplitType } from 'shared'

export class GroupPermissions extends GroupMemberPermissions {
  private checkSplitPermission(split: SplitInfo, type: SplitPermissionType) {
    return (
      type === SplitPermissionType.All ||
      (type === SplitPermissionType.OnlyIfIncluded &&
        (split.isUserParticipating ||
          split.createdById === auth.currentUser?.uid ||
          split.paidById === auth.currentUser?.uid))
    )
  }

  canDeleteSplit(split: SplitInfo): boolean {
    return this.checkSplitPermission(split, this.canDeleteSplits())
  }

  canUpdateSplit(split: SplitInfo): boolean {
    if (split.type & SplitType.SettleUp) {
      // Settle up splits are not editable
      return false
    }

    return this.checkSplitPermission(split, this.canUpdateSplits())
  }

  canSeeSplitDetails(split: SplitInfo): boolean {
    return this.checkSplitPermission(split, this.canSeeSplitsDetails())
  }
}
