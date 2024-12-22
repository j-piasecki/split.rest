import {
  AddUserToGroupArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetBalancesWithEmailsArguments,
  GetBalancesWithIdsArguments,
  GetGroupInfoArguments,
  GetGroupJoinLinkArguments,
  GetGroupMemberPermissionsArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupMetadataByLinkArguments,
  GetGroupSplitsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  JoinGroupByLinkArguments,
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupNameArguments,
  UpdateSplitArguments,
} from './endpointArguments'

export function isCreateGroupArguments(obj: any): obj is CreateGroupArguments {
  return obj.name !== undefined && obj.currency !== undefined
}

export function isAddUserToGroupArguments(obj: any): obj is AddUserToGroupArguments {
  return obj.groupId !== undefined && obj.userId !== undefined
}

export function isCreateSplitArguments(obj: any): obj is CreateSplitArguments {
  return (
    obj.groupId !== undefined &&
    obj.title !== undefined &&
    obj.total !== undefined &&
    obj.balances !== undefined &&
    obj.paidBy !== undefined &&
    obj.timestamp !== undefined
  )
}

export function isDeleteSplitArguments(obj: any): obj is DeleteSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isRestoreSplitArguments(obj: any): obj is RestoreSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isUpdateSplitArguments(obj: any): obj is UpdateSplitArguments {
  return (
    obj.groupId !== undefined &&
    obj.splitId !== undefined &&
    obj.title !== undefined &&
    obj.total !== undefined &&
    obj.balances !== undefined &&
    obj.paidBy !== undefined &&
    obj.timestamp !== undefined
  )
}

export function isSetGroupAccessArguments(obj: any): obj is SetGroupAccessArguments {
  return obj.groupId !== undefined && obj.userId !== undefined && obj.access !== undefined
}

export function isSetGroupAdminArguments(obj: any): obj is SetGroupAdminArguments {
  return obj.groupId !== undefined && obj.userId !== undefined && obj.admin !== undefined
}

export function isSetGroupHiddenArguments(obj: any): obj is SetGroupHiddenArguments {
  return obj.groupId !== undefined && obj.hidden !== undefined
}

export function isGetGroupMembersArguments(obj: any): obj is GetGroupMembersArguments {
  return obj.groupId !== undefined
}

export function isGetGroupSplitsArguments(obj: any): obj is GetGroupSplitsArguments {
  return obj.groupId !== undefined
}

export function isGetUserGroupsArguments(obj: any): obj is GetUserGroupsArguments {
  return obj.hidden !== undefined
}

export function isGetUserByEmailArguments(obj: any): obj is GetUserByEmailArguments {
  return obj.email !== undefined
}

export function isGetUserByIdArguments(obj: any): obj is GetUserByIdArguments {
  return obj.userId !== undefined
}

export function isGetGroupInfoArguments(obj: any): obj is GetGroupInfoArguments {
  return obj.groupId !== undefined
}

export function isGetGroupMembersAutocompletionsArguments(
  obj: any
): obj is GetGroupMembersAutocompletionsArguments {
  return obj.groupId !== undefined && obj.query !== undefined
}

export function isGetSplitInfoArguments(obj: any): obj is GetSplitInfoArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isGetBalancesArguments(obj: any): obj is GetBalancesArguments {
  return (
    obj.groupId !== undefined &&
    ((obj.users !== undefined && Array.isArray(obj.users)) ||
      (obj.emails !== undefined && Array.isArray(obj.emails)))
  )
}

export function isGetBalancesWithIdsArguments(obj: any): obj is GetBalancesWithIdsArguments {
  return obj.groupId !== undefined && obj.users !== undefined && Array.isArray(obj.users)
}

export function isGetBalancesWithEmailsArguments(obj: any): obj is GetBalancesWithEmailsArguments {
  return obj.groupId !== undefined && obj.emails !== undefined && Array.isArray(obj.emails)
}

export function isDeleteGroupArguments(obj: any): obj is DeleteGroupArguments {
  return obj.groupId !== undefined
}

export function isSetGroupNameArguments(obj: any): obj is SetGroupNameArguments {
  return obj.groupId !== undefined && obj.name !== undefined
}

export function isCreateGroupJoinLinkArguments(obj: any): obj is CreateGroupJoinLinkArguments {
  return obj.groupId !== undefined
}

export function isGetGroupJoinLinkArguments(obj: any): obj is GetGroupJoinLinkArguments {
  return obj.groupId !== undefined
}

export function isDeleteGroupJoinLinkArguments(obj: any): obj is DeleteGroupJoinLinkArguments {
  return obj.groupId !== undefined
}

export function isGetGroupMetadataByLinkArguments(
  obj: any
): obj is GetGroupMetadataByLinkArguments {
  return obj.uuid !== undefined
}

export function isJoinGroupByLinkArguments(obj: any): obj is JoinGroupByLinkArguments {
  return obj.uuid !== undefined
}

export function isGetSplitHistoryArguments(obj: any): obj is GetSplitHistoryArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isGetGroupMemberPermissionsArguments(
  obj: any
): obj is GetGroupMemberPermissionsArguments {
  return obj.groupId !== undefined
}
