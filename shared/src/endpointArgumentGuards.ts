import {
  AcceptGroupInviteArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetDirectGroupInvitesArguments,
  GetGroupInfoArguments,
  GetGroupInviteByLinkArguments,
  GetGroupJoinLinkArguments,
  GetGroupMemberInfoArguments,
  GetGroupMemberPermissionsArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupSplitsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  GetUserInvitesArguments,
  InviteUserToGroupArguments,
  JoinGroupByLinkArguments,
  RegisterOrUpdateNotificationTokenArguments,
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupInviteRejectedArguments,
  SetGroupInviteWithdrawnArguments,
  SetGroupNameArguments,
  SetUserDisplayNameArguments,
  SetUserNameArguments,
  SettleUpArguments,
  UnregisterNotificationTokenArguments,
  UpdateSplitArguments,
} from './endpointArguments'

export function isCreateGroupArguments(obj: any): obj is CreateGroupArguments {
  return obj.name !== undefined && obj.currency !== undefined
}

export function isInviteUserToGroupArguments(obj: any): obj is InviteUserToGroupArguments {
  return obj.groupId !== undefined && obj.userId !== undefined
}

export function isCreateSplitArguments(obj: any): obj is CreateSplitArguments {
  return (
    obj.groupId !== undefined &&
    obj.title !== undefined &&
    obj.total !== undefined &&
    obj.balances !== undefined &&
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

export function isGetBalancesWithIdsArguments(obj: any): obj is GetBalancesArguments {
  return obj.groupId !== undefined && obj.users !== undefined && Array.isArray(obj.users)
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

export function isGetGroupInviteByLinkArguments(obj: any): obj is GetGroupInviteByLinkArguments {
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

export function isGetUserInvitesArguments(obj: any): obj is GetUserInvitesArguments {
  return obj.rejected !== undefined
}

export function isAcceptGroupInviteArguments(obj: any): obj is AcceptGroupInviteArguments {
  return obj.groupId !== undefined
}

export function isSetGroupInviteRejectedArguments(
  obj: any
): obj is SetGroupInviteRejectedArguments {
  return obj.groupId !== undefined && obj.rejected !== undefined
}

export function isGetGroupMemberInfoArguments(obj: any): obj is GetGroupMemberInfoArguments {
  return obj.groupId !== undefined && obj.memberId !== undefined
}

export function isGetDirectGroupInvitesArguments(obj: any): obj is GetDirectGroupInvitesArguments {
  return obj.groupId !== undefined
}

export function isSetGroupInviteWithdrawnArguments(
  obj: any
): obj is SetGroupInviteWithdrawnArguments {
  return obj.groupId !== undefined && obj.userId !== undefined && obj.withdrawn !== undefined
}

export function isSetUserNameArguments(obj: any): obj is SetUserNameArguments {
  return obj.name !== undefined
}

export function isSettleUpArguments(obj: any): obj is SettleUpArguments {
  return obj.groupId !== undefined
}

export function isSetUserDisplayNameArguments(obj: any): obj is SetUserDisplayNameArguments {
  return obj.groupId !== undefined && obj.userId !== undefined && obj.displayName !== undefined
}

export function isRegisterOrUpdateNotificationTokenArguments(
  obj: any
): obj is RegisterOrUpdateNotificationTokenArguments {
  return obj.token !== undefined && obj.language !== undefined
}

export function isUnregisterNotificationTokenArguments(
  obj: any
): obj is UnregisterNotificationTokenArguments {
  return obj.token !== undefined
}
