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
  isAdmin: boolean
  hasAccess: boolean
  balance: string
}

export interface Member {
  id: string
  name: string
  email: string
  photoURL: string
  balance: string
  isAdmin: boolean
  hasAccess: boolean
}

export interface BalanceChange {
  id: string
  change: number
}

export interface SplitInfo {
  id: number
  title: string
  total: string
  timestamp: number
  paidById: string
  createdById: string
}

export interface Split extends SplitInfo {
  changes: BalanceChange[]
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
  title: string
  total: number
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
  title: string
  total: number
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

export interface GetGroupInfoArguments {
  groupId: number
}

export interface GetGroupMembersAutocompletionsArguments {
  groupId: number
  query: string
}


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
  return obj.groupId !== undefined && obj.title !== undefined && obj.total !== undefined && obj.balances !== undefined
}

export function isDeleteSplitArguments(obj: any): obj is DeleteSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isRestoreSplitArguments(obj: any): obj is RestoreSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined
}

export function isUpdateSplitArguments(obj: any): obj is UpdateSplitArguments {
  return obj.groupId !== undefined && obj.splitId !== undefined && obj.title !== undefined && obj.total !== undefined && obj.balances !== undefined
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

export function isGetGroupInfoArguments(obj: any): obj is GetGroupInfoArguments {
  return obj.groupId !== undefined
}

export function isGetGroupMembersAutocompletionsArguments(obj: any): obj is GetGroupMembersAutocompletionsArguments {
  return obj.groupId !== undefined && obj.query !== undefined
}
