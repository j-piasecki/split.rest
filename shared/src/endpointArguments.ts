import { BalanceChange, SplitInfo, SplitMethod, SplitQuery, SplitType } from './types'

export interface CreateGroupArguments {
  name: string
  currency: string
  allowedSplitMethods?: SplitMethod[]
}

export interface InviteUserToGroupArguments {
  groupId: number
  userId: string
}

export interface CreateSplitArguments {
  groupId: number
  paidBy?: string
  title: string
  total: string
  timestamp: number
  balances: BalanceChange[]
  type: number
  currency: string
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
  paidBy?: string
  title: string
  total: string
  timestamp: number
  balances: BalanceChange[]
  currency: string
}

export interface ResolveDelayedSplitArguments extends UpdateSplitArguments {
  type: SplitType
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
  lowToHigh?: boolean
  startAfterBalance?: string
}

export interface GetGroupSplitsArguments {
  groupId: number
  onlyIfIncluded?: boolean
  startAfterId?: number
}

export interface QueryGroupSplitsArguments {
  groupId: number
  startAfter?: SplitInfo
  query: SplitQuery
}

export interface GetUserGroupsArguments {
  startAfterId?: number
  startAfterUpdate?: number
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

export interface SettleUpArguments {
  groupId: number
  withMembers?: string[]
}

export interface ConfirmSettleUpArguments {
  groupId: number
  entriesHash: string
  withMembers?: string[]
}

export interface SetUserDisplayNameArguments {
  groupId: number
  userId: string
  displayName: string | null
}

export interface RegisterOrUpdateNotificationTokenArguments {
  token: string
  language: string
}

export interface UnregisterNotificationTokenArguments {
  token: string
}

export interface CompleteSplitEntryArguments {
  groupId: number
  splitId: number
  userId: string
}

export interface GetSplitParticipantsSuggestionsArguments {
  groupId: number
}

export interface SetGroupLockedArguments {
  groupId: number
  locked: boolean
}

export interface SettleUpGroupArguments {
  groupId: number
}

export interface DelayedSplitResolutionMethod {
  type: 'equally'
  members: Array<{
    id: string
    excludedSplits?: number[]
  }>
}

export interface ResolveAllDelayedSplitsAtOnceArguments {
  groupId: number
  resolutionMethod: DelayedSplitResolutionMethod
}

export interface SetAllowedSplitMethodsArguments {
  groupId: number
  allowedSplitMethods: SplitMethod[]
}

export interface GetGroupMonthlyStatsArguments {
  groupId: number
}
