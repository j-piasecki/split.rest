import { BalanceChange } from './types'

export interface CreateGroupArguments {
  name: string
  currency: string
}

export interface InviteUserToGroupArguments {
  groupId: number
  userId: string
}

export interface CreateSplitArguments {
  groupId: number
  paidBy: string
  title: string
  total: string
  timestamp: number
  balances: BalanceChange[]
}

export interface DeleteSplitArguments {
  groupId: number
  splitId: number
}

export interface RestoreSplitArguments {
  groupId: number
  splitId: number
}

export interface UpdateSplitArguments {
  groupId: number
  splitId: number
  paidBy: string
  title: string
  total: number
  timestamp: number
  balances: BalanceChange[]
}

export interface SetGroupAccessArguments {
  groupId: number
  userId: string
  access: boolean
}

export interface SetGroupAdminArguments {
  groupId: number
  userId: string
  admin: boolean
}

export interface SetGroupHiddenArguments {
  groupId: number
  hidden: boolean
}

export interface GetGroupMembersArguments {
  groupId: number
  startAfter?: string
}

export interface GetGroupSplitsArguments {
  groupId: number
  onlyIfIncluded?: boolean
  startAfterId?: number
}

export interface GetUserGroupsArguments {
  startAfter?: number
  hidden: boolean
}

export interface GetUserByEmailArguments {
  email: string
}

export interface GetUserByIdArguments {
  userId: string
}

export interface GetGroupInfoArguments {
  groupId: number
}

export interface DeleteGroupArguments {
  groupId: number
}

export interface GetGroupMembersAutocompletionsArguments {
  groupId: number
  query: string
}

export interface GetSplitInfoArguments {
  groupId: number
  splitId: number
}

export interface GetBalancesArguments {
  groupId: number
  users: string[]
}

export interface SetGroupNameArguments {
  groupId: number
  name: string
}

export interface CreateGroupJoinLinkArguments {
  groupId: number
}

export interface GetGroupJoinLinkArguments {
  groupId: number
}

export interface DeleteGroupJoinLinkArguments {
  groupId: number
}

export interface GetGroupInviteByLinkArguments {
  uuid: string
}

export interface JoinGroupByLinkArguments {
  uuid: string
}

export interface GetSplitHistoryArguments {
  groupId: number
  splitId: number
  startAfter?: number
}

export interface GetGroupMemberPermissionsArguments {
  groupId: number
  userId?: string
}

export interface GetUserInvitesArguments {
  startAfter?: number
  rejected: boolean
}

export interface AcceptGroupInviteArguments {
  groupId: number
}

export interface SetGroupInviteRejectedArguments {
  groupId: number
  rejected: boolean
}

export interface GetGroupMemberInfoArguments {
  groupId: number
  memberId: string
}

export interface GetDirectGroupInvitesArguments {
  startAfter?: number
  onlyIfCreated?: boolean
  groupId: number
}

export interface SetGroupInviteWithdrawnArguments {
  onlyIfCreated: boolean | undefined
  groupId: number
  userId: string
  withdrawn: boolean
}

export interface SetUserNameArguments {
  name: string
}
