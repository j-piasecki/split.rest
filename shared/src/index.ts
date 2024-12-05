export interface User {
  id: string
  name: string
  email: string
  photoURL: string
}

export interface GroupMetadata {
  id: number
  hidden: boolean
}

export interface GroupInfo extends GroupMetadata {
  name: string
  currency: string
  memberCount: number
  owner: string
  isAdmin: boolean
  hasAccess: boolean
  balance: string
}

export interface Member extends User {
  balance: string
  isAdmin: boolean
  hasAccess: boolean
}

export interface BalanceChange {
  id: string
  change: number
}

export interface UserWithBalanceChange extends User {
  change: string
}

export interface SplitInfo {
  id: number
  title: string
  total: string
  timestamp: number
  paidById: string
  createdById: string
}

export interface SplitWithChanges extends SplitInfo {
  changes: BalanceChange[]
}

export interface SplitWithUsers extends SplitInfo {
  users: UserWithBalanceChange[]
}

export interface CreateGroupArguments {
  name: string
  currency: string
}

export interface AddUserToGroupArguments {
  groupId: number
  userId: string
}

export interface CreateSplitArguments {
  groupId: number
  paidBy: string
  title: string
  total: number
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
  startAfterTimestamp?: number
}

export interface GetUserGroupsArguments  {
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

export interface GetGroupMembersAutocompletionsArguments {
  groupId: number
  query: string
}

export interface GetSplitInfoArguments {
  groupId: number
  splitId: number
}

export interface GetBalancesWithIdsArguments {
  groupId: number
  users: string[]
}

export interface GetBalancesWithEmailsArguments {
  groupId: number
  emails: string[]
}

export type GetBalancesArguments = GetBalancesWithIdsArguments | GetBalancesWithEmailsArguments

export function isUser(obj: any): obj is User {
  return obj.id !== undefined && obj.name !== undefined && obj.email !== undefined && obj.photoURL !== undefined
}

export function isCreateGroupArguments(obj: any): obj is CreateGroupArguments {
  return obj.name !== undefined && obj.currency !== undefined
}

export function isAddUserToGroupArguments(obj: any): obj is AddUserToGroupArguments {
  return obj.groupId !== undefined && obj.userId !== undefined
}

export function isCreateSplitArguments(obj: any): obj is CreateSplitArguments {
  return obj.groupId !== undefined && obj.title !== undefined && obj.total !== undefined && obj.balances !== undefined && obj.paidBy !== undefined && obj.timestamp !== undefined
}

export function isDeleteSplitArguments(obj: any): obj is DeleteSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isRestoreSplitArguments(obj: any): obj is RestoreSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isUpdateSplitArguments(obj: any): obj is UpdateSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined && obj.title !== undefined && obj.total !== undefined && obj.balances !== undefined && obj.paidBy !== undefined && obj.timestamp !== undefined
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

export function isGetGroupMembersAutocompletionsArguments(obj: any): obj is GetGroupMembersAutocompletionsArguments {
  return obj.groupId !== undefined && obj.query !== undefined
}

export function isGetSplitInfoArguments(obj: any): obj is GetSplitInfoArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isGetBalancesArguments(obj: any): obj is GetBalancesArguments {
  return obj.groupId !== undefined && ((obj.users !== undefined && Array.isArray(obj.users)) || (obj.emails !== undefined && Array.isArray(obj.emails)))
}

export function isGetBalancesWithIdsArguments(obj: any): obj is GetBalancesWithIdsArguments {
  return obj.groupId !== undefined && obj.users !== undefined && Array.isArray(obj.users)
}

export function isGetBalancesWithEmailsArguments(obj: any): obj is GetBalancesWithEmailsArguments {
  return obj.groupId !== undefined && obj.emails !== undefined && Array.isArray(obj.emails)
}
