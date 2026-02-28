import { SplitInfo, isSettleUpSplit } from './types'

export const PermissionKeys = [
  'createSplit',
  'querySplits',
  'seeSplitDetails',
  'updateSplit',
  'deleteSplit',
  'restoreSplit',
  'completeSplitEntry',
  'uncompleteSplitEntry',
  'resolveDelayedSplits',
  'resolveAllDelayedSplitsAtOnce',
  'accessRoulette',
  'settleUp',
  'readMembers',
  'inviteMembers',
  'removeMembers',
  'renameGroup',
  'deleteGroup',
  'seeJoinLink',
  'createJoinLink',
  'deleteJoinLink',
  'manageAccess',
  'manageAdmins',
  'readPermissions',
  'managePermissions',
  'manageDirectInvites',
  'manageAllDirectInvites',
  'changeDisplayName',
  'lockGroup',
  'settleUpGroup',
  'manageAllowedSplitMethods',
  'seeGroupTrends',
  'manageGroupIcon',
] as const

export const enum SplitPermissionsDTO {
  None = 0 << 0,
  Create = 1 << 0, // Create new splits
  Read = 1 << 1, // Read splits in which the user is included
  ReadAll = 1 << 2, // Read all splits
  SeeDetails = 1 << 3, // See details of splits in which the user is included
  SeeDetailsAll = 1 << 4, // See details of all splits
  Update = 1 << 5, // Update splits in which the user is included
  UpdateAll = 1 << 6, // Update all splits
  Delete = 1 << 7, // Delete splits in which the user is included
  DeleteAll = 1 << 8, // Delete all splits
  Restore = 1 << 9, // Restore splits in which the user is included (allows to see affected deleted splits)
  RestoreAll = 1 << 10, // Restore all splits (allows to see all deleted splits)
  AccessRoulette = 1 << 11, // Access the roulette
  SettleUp = 1 << 12, // Access to settle up
  CompleteSplitEntry = 1 << 13, // Complete split entries
  UncompleteSplitEntry = 1 << 14, // Uncomplete split entries
  Query = 1 << 15, // Query splits
  ResolveDelayedSplits = 1 << 16, // Resolve delayed splits created by the user
  ResolveDelayedSplitsAll = 1 << 17, // Resolve all delayed splits
  ResolveAllDelayedSplitsAtOnce = 1 << 18, // Resolve all delayed splits at once
}

export enum SplitPermissionType {
  None,
  OnlyIfIncluded,
  All,
}

function splitPermissionTypeToString(type: SplitPermissionType): string {
  switch (type) {
    case SplitPermissionType.None:
      return 'None'
    case SplitPermissionType.OnlyIfIncluded:
      return 'OnlyIfIncluded'
    case SplitPermissionType.All:
      return 'All'
  }
}

export const enum MembersPermissionsDTO {
  None = 0 << 0,
  Read = 1 << 0, // Read members of the group (if not, the user cannot get hints when adding splits and in the roulette)
  Invite = 1 << 1, // Invite new members to the group
  Remove = 1 << 2, // Remove members from the group
}

export const enum ManagePermissionsDTO {
  None = 0 << 0,
  Rename = 1 << 0, // Rename the group
  Delete = 1 << 1, // Delete the group
  SeeJoinLink = 1 << 2, // See the join link of the group
  CreateJoinLink = 1 << 3, // Create a join link for the group
  DeleteJoinLink = 1 << 4, // Delete the join link of the group
  ManageAccess = 1 << 5, // Manage access to the group
  ManageAdmins = 1 << 6, // Manage admins of the group
  ReadPermissions = 1 << 7, // Read permissions of the group
  ManagePermissions = 1 << 8, // Manage permissions of the group (cannot grant permissions that the doer does not have)
  ManageDirectInvites = 1 << 9, // Manage direct invites to the group created by the user
  ManageAllDirectInvites = 1 << 10, // Manage all direct invites to the group
  ChangeDisplayName = 1 << 11, // Change display name  of the user in the group
  ChangeEveryoneDisplayName = 1 << 12, // Change the display name of everyone in the group
  LockGroup = 1 << 13, // Lock or unlock the group
  SettleUpGroup = 1 << 14, // Settle up the group
  ManageAllowedSplitMethods = 1 << 15, // Manage allowed split methods of the group
  SeeGroupTrends = 1 << 16, // See group trends
  ManageGroupIcon = 1 << 17, // Manage the group icon
}

export interface GroupMemberPermissionsDTO {
  splits: SplitPermissionsDTO
  members: MembersPermissionsDTO
  manage: ManagePermissionsDTO
}

export class GroupMemberPermissions implements GroupMemberPermissionsDTO {
  readonly splits: SplitPermissionsDTO
  readonly members: MembersPermissionsDTO
  readonly manage: ManagePermissionsDTO

  constructor(
    splits: SplitPermissionsDTO,
    members: MembersPermissionsDTO,
    manage: ManagePermissionsDTO
  ) {
    this.splits = splits
    this.members = members
    this.manage = manage
  }

  private checkSplitPermission(
    userId: string | undefined,
    split: SplitInfo,
    type: SplitPermissionType
  ) {
    return (
      type === SplitPermissionType.All ||
      (type === SplitPermissionType.OnlyIfIncluded &&
        (split.isUserParticipating || split.createdById === userId || split.paidBy?.id === userId))
    )
  }

  canDeleteSplit(userId: string | undefined, split: SplitInfo): boolean {
    return this.checkSplitPermission(userId, split, this.canDeleteSplits())
  }

  canUpdateSplit(userId: string | undefined, split: SplitInfo): boolean {
    if (isSettleUpSplit(split.type)) {
      // Settle up splits are not editable
      return false
    }

    return this.checkSplitPermission(userId, split, this.canUpdateSplits())
  }

  canSeeSplitDetails(userId: string | undefined, split: SplitInfo): boolean {
    return this.checkSplitPermission(userId, split, this.canSeeSplitsDetails())
  }

  canResolveDelayedSplit(userId: string | undefined, split: SplitInfo): boolean {
    return this.checkSplitPermission(userId, split, this.canResolveDelayedSplits())
  }

  canCreateSplits(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.Create)
  }

  canQuerySplits(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.Query)
  }

  canSeeSplitsDetails(): SplitPermissionType {
    if (this.splits & SplitPermissionsDTO.SeeDetailsAll) {
      return SplitPermissionType.All
    }

    if (this.splits & SplitPermissionsDTO.SeeDetails) {
      return SplitPermissionType.OnlyIfIncluded
    }

    return SplitPermissionType.None
  }

  canUpdateSplits(): SplitPermissionType {
    if (this.splits & SplitPermissionsDTO.UpdateAll) {
      return SplitPermissionType.All
    }

    if (this.splits & SplitPermissionsDTO.Update) {
      return SplitPermissionType.OnlyIfIncluded
    }

    return SplitPermissionType.None
  }

  canDeleteSplits(): SplitPermissionType {
    if (this.splits & SplitPermissionsDTO.DeleteAll) {
      return SplitPermissionType.All
    }

    if (this.splits & SplitPermissionsDTO.Delete) {
      return SplitPermissionType.OnlyIfIncluded
    }

    return SplitPermissionType.None
  }

  canRestoreSplits(): SplitPermissionType {
    if (this.splits & SplitPermissionsDTO.RestoreAll) {
      return SplitPermissionType.All
    }

    if (this.splits & SplitPermissionsDTO.Restore) {
      return SplitPermissionType.OnlyIfIncluded
    }

    return SplitPermissionType.None
  }

  canCompleteSplitEntry(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.CompleteSplitEntry)
  }

  canUncompleteSplitEntry(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.UncompleteSplitEntry)
  }

  canResolveDelayedSplits(): SplitPermissionType {
    if (this.splits & SplitPermissionsDTO.ResolveDelayedSplitsAll) {
      return SplitPermissionType.All
    }

    if (this.splits & SplitPermissionsDTO.ResolveDelayedSplits) {
      return SplitPermissionType.OnlyIfIncluded
    }

    return SplitPermissionType.None
  }

  canResolveAllDelayedSplitsAtOnce(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.ResolveAllDelayedSplitsAtOnce)
  }

  canAccessRoulette(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.AccessRoulette)
  }

  canSettleUp(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.SettleUp)
  }

  canReadMembers(): boolean {
    return Boolean(this.members & MembersPermissionsDTO.Read)
  }

  canInviteMembers(): boolean {
    return Boolean(this.members & MembersPermissionsDTO.Invite)
  }

  canRemoveMembers(): boolean {
    return Boolean(this.members & MembersPermissionsDTO.Remove)
  }

  canRenameGroup(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.Rename)
  }

  canDeleteGroup(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.Delete)
  }

  canSeeJoinLink(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.SeeJoinLink)
  }

  canCreateJoinLink(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.CreateJoinLink)
  }

  canDeleteJoinLink(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.DeleteJoinLink)
  }

  canManageAccess(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManageAccess)
  }

  canManageAdmins(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManageAdmins)
  }

  canReadPermissions(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ReadPermissions)
  }

  canManagePermissions(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManagePermissions)
  }

  canManageDirectInvites(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManageDirectInvites)
  }

  canManageAllDirectInvites(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManageAllDirectInvites)
  }

  canChangeDisplayName(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ChangeDisplayName)
  }

  canChangeEveryoneDisplayName(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ChangeEveryoneDisplayName)
  }

  canLockGroup(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.LockGroup)
  }

  canSettleUpGroup(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.SettleUpGroup)
  }

  canManageAllowedSplitMethods(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManageAllowedSplitMethods)
  }

  canSeeGroupTrends(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.SeeGroupTrends)
  }

  canManageGroupIcon(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManageGroupIcon)
  }

  toObject() {
    return {
      createSplit: this.canCreateSplits(),
      querySplits: this.canQuerySplits(),
      seeSplitsDetails: splitPermissionTypeToString(this.canSeeSplitsDetails()),
      updateSplits: splitPermissionTypeToString(this.canUpdateSplits()),
      deleteSplits: splitPermissionTypeToString(this.canDeleteSplits()),
      restoreSplits: splitPermissionTypeToString(this.canRestoreSplits()),
      completeSplitEntry: this.canCompleteSplitEntry(),
      uncompleteSplitEntry: this.canUncompleteSplitEntry(),
      resolveDelayedSplits: splitPermissionTypeToString(this.canResolveDelayedSplits()),
      resolveAllDelayedSplitsAtOnce: this.canResolveAllDelayedSplitsAtOnce(),
      accessRoulette: this.canAccessRoulette(),
      settleUp: this.canSettleUp(),
      readMembers: this.canReadMembers(),
      inviteMembers: this.canInviteMembers(),
      removeMembers: this.canRemoveMembers(),
      renameGroup: this.canRenameGroup(),
      deleteGroup: this.canDeleteGroup(),
      seeJoinLink: this.canSeeJoinLink(),
      createJoinLink: this.canCreateJoinLink(),
      deleteJoinLink: this.canDeleteJoinLink(),
      manageAccess: this.canManageAccess(),
      manageAdmins: this.canManageAdmins(),
      readPermissions: this.canReadPermissions(),
      managePermissions: this.canManagePermissions(),
      manageDirectInvites: this.canManageDirectInvites(),
      manageAllDirectInvites: this.canManageAllDirectInvites(),
      changeDisplayName: this.canChangeDisplayName(),
      changeEveryoneDisplayName: this.canChangeEveryoneDisplayName(),
      lockGroup: this.canLockGroup(),
      settleUpGroup: this.canSettleUpGroup(),
      manageAllowedSplitMethods: this.canManageAllowedSplitMethods(),
      seeGroupTrends: this.canSeeGroupTrends(),
      manageGroupIcon: this.canManageGroupIcon(),
    }
  }
}
