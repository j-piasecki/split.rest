export const PermissionKeys = [
  'createSplit',
  'readSplits',
  'querySplits',
  'seeSplitDetails',
  'updateSplit',
  'deleteSplit',
  'restoreSplit',
  'completeSplitEntry',
  'uncompleteSplitEntry',
  'resolveDelayedSplits',
  'accessRoulette',
  'settleUp',
  'readMembers',
  'inviteMembers',
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

  canCreateSplits(): boolean {
    return Boolean(this.splits & SplitPermissionsDTO.Create)
  }

  canReadSplits(): SplitPermissionType {
    if (this.splits & SplitPermissionsDTO.ReadAll) {
      return SplitPermissionType.All
    }

    if (this.splits & SplitPermissionsDTO.Read) {
      return SplitPermissionType.OnlyIfIncluded
    }

    return SplitPermissionType.None
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

  toObject() {
    return {
      createSplit: this.canCreateSplits(),
      readSplits: splitPermissionTypeToString(this.canReadSplits()),
      querySplits: this.canQuerySplits(),
      seeSplitsDetails: splitPermissionTypeToString(this.canSeeSplitsDetails()),
      updateSplits: splitPermissionTypeToString(this.canUpdateSplits()),
      deleteSplits: splitPermissionTypeToString(this.canDeleteSplits()),
      restoreSplits: splitPermissionTypeToString(this.canRestoreSplits()),
      completeSplitEntry: this.canCompleteSplitEntry(),
      uncompleteSplitEntry: this.canUncompleteSplitEntry(),
      resolveDelayedSplits: splitPermissionTypeToString(this.canResolveDelayedSplits()),
      accessRoulette: this.canAccessRoulette(),
      settleUp: this.canSettleUp(),
      readMembers: this.canReadMembers(),
      inviteMembers: this.canInviteMembers(),
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
    }
  }
}
