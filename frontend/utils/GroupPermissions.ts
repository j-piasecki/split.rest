import { auth } from './firebase'
import { GroupMemberPermissions, SplitInfo, SplitPermissionType } from 'shared'

export class GroupPermissions extends GroupMemberPermissions {
  canDeleteSplit(split: SplitInfo): boolean {
    // TODO: this is more restrictive than the backend, user can also be a participant
    return (
      this.canDeleteSplits() === SplitPermissionType.All ||
      (this.canDeleteSplits() === SplitPermissionType.OnlyIfIncluded &&
        (split.createdById === auth.currentUser?.uid || split.paidById === auth.currentUser?.uid))
    )
  }

  canUpdateSplit(split: SplitInfo): boolean {
    // TODO: this is more restrictive than the backend, user can also be a participant
    return (
      this.canUpdateSplits() === SplitPermissionType.All ||
      (this.canUpdateSplits() === SplitPermissionType.OnlyIfIncluded &&
        (split.createdById === auth.currentUser?.uid || split.paidById === auth.currentUser?.uid))
    )
  }

  canSeeSplitDetails(split: SplitInfo): boolean {
    // TODO: this is more restrictive than the backend, user can also be a participant
    return (
      this.canSeeSplitsDetails() === SplitPermissionType.All ||
      (this.canSeeSplitsDetails() === SplitPermissionType.OnlyIfIncluded &&
        (split.createdById === auth.currentUser?.uid || split.paidById === auth.currentUser?.uid))
    )
  }
}
