export const enum SplitPermissionsDTO {
  None = 0 << 0,
  Create = 1 << 0, // Create new splits
  Read = 1 << 1, // Read splits in which the user is included
  ReadAll = 1 << 2, // Read all splits
  Update = 1 << 3, // Update splits in which the user is included
  UpdateAll = 1 << 4, // Update all splits
  Delete = 1 << 5, // Delete splits in which the user is included
  DeleteAll = 1 << 6, // Delete all splits
  Restore = 1 << 7, // Restore splits in which the user is included (allows to see affected deleted splits)
  RestoreAll = 1 << 8, // Restore all splits (allows to see all deleted splits)
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
  Add = 1 << 1, // Add new members to the group
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
  ManagePermissions = 1 << 7, // Manage permissions of the group (cannot grant permissions that the doer does not have)
}

export class GroupMemberPermissions {
  readonly splits: SplitPermissionsDTO
  readonly members: MembersPermissionsDTO
  readonly manage: ManagePermissionsDTO

  constructor(splits: SplitPermissionsDTO, members: MembersPermissionsDTO, manage: ManagePermissionsDTO) {
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

  canReadMembers(): boolean {
    return Boolean(this.members & MembersPermissionsDTO.Read)
  }

  canAddMembers(): boolean {
    return Boolean(this.members & MembersPermissionsDTO.Add)
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

  canManagePermissions(): boolean {
    return Boolean(this.manage & ManagePermissionsDTO.ManagePermissions)
  }

  toObject() {
    return {
      createSplit: this.canCreateSplits(),
      readSplits: splitPermissionTypeToString(this.canReadSplits()),
      updateSplits: splitPermissionTypeToString(this.canUpdateSplits()),
      deleteSplits: splitPermissionTypeToString(this.canDeleteSplits()),
      restoreSplits: splitPermissionTypeToString(this.canRestoreSplits()),
      readMembers: this.canReadMembers(),
      addMembers: this.canAddMembers(),
      renameGroup: this.canRenameGroup(),
      deleteGroup: this.canDeleteGroup(),
      seeJoinLink: this.canSeeJoinLink(),
      createJoinLink: this.canCreateJoinLink(),
      deleteJoinLink: this.canDeleteJoinLink(),
      manageAccess: this.canManageAccess(),
      manageAdmins: this.canManageAdmins(),
      managePermissions: this.canManagePermissions(),
    }
  }
}
