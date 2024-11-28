export interface User {
  id: string
  name: string
  email: string
  photoURL: string
}

export interface GroupMetadata {
  id: string
  hidden: boolean
}

export interface GroupInfo extends GroupMetadata {
  name: string
  currency: string
  memberCount: number
  isAdmin: boolean
  hasAccess: boolean
}

export interface GroupInfoWithBalance extends GroupInfo {
  balance: number
}

export interface Member {
  id: string
  name: string
  email: string
  photoURL: string
  balance: number
  isAdmin: boolean
  hasAccess: boolean
}

export interface BalanceChange {
  id: string
  change: number
}

export interface Split {
  id: string
  title: string
  total: number
  timestamp: number
  paidById: string
  changes: BalanceChange[]
}

export interface CreateGroupArguments {
  name: string
  currency: string
}

export interface AddUserToGroupArguments {
  groupId: string
  userId: string
}

export interface CreateSplitArguments {
  groupId: string
  title: string
  total: number
  balances: BalanceChange[]
}

export interface DeleteSplitArguments {
  groupId: string
  splitId: string
}

export interface RestoreSplitArguments {
  groupId: string
  splitId: string
}

export interface UpdateSplitArguments {
  groupId: string
  splitId: string
  title: string
  total: number
  balances: BalanceChange[]
}

export interface SetGroupAccessArguments {
  groupId: string
  userId: string
  access: boolean
}

export interface SetGroupAdminArguments {
  groupId: string
  userId: string
  admin: boolean
}

export interface SetGroupHiddenArguments {
  groupId: string
  hidden: boolean
}

export interface GetGroupMembersArguments {
  groupId: string
  startAfter?: string
}

export interface GetGroupSplitsArguments {
  groupId: string
  startAfterTimestamp?: number
}


export function isUser(obj: any): obj is User {
  return obj.id && obj.name && obj.email && obj.photoURL
}

export function isCreateGroupArguments(obj: any): obj is CreateGroupArguments {
  return obj.name && obj.currency
}

export function isAddUserToGroupArguments(obj: any): obj is AddUserToGroupArguments {
  return obj.groupId && obj.userId
}

export function isCreateSplitArguments(obj: any): obj is CreateSplitArguments {
  return obj.groupId && obj.title && obj.total && obj.balances
}

export function isDeleteSplitArguments(obj: any): obj is DeleteSplitArguments {
  return obj.groupId && obj.splitId
}

export function isRestoreSplitArguments(obj: any): obj is RestoreSplitArguments {
  return obj.groupId && obj.splitId
}

export function isUpdateSplitArguments(obj: any): obj is UpdateSplitArguments {
  return obj.groupId && obj.splitId && obj.title && obj.total && obj.balances
}

export function isSetGroupAccessArguments(obj: any): obj is SetGroupAccessArguments {
  return obj.groupId && obj.userId && obj.access
}

export function isSetGroupAdminArguments(obj: any): obj is SetGroupAdminArguments {
  return obj.groupId && obj.userId && obj.admin
}

export function isSetGroupHiddenArguments(obj: any): obj is SetGroupHiddenArguments {
  return obj.groupId && obj.hidden
}

export function isGetGroupMembersArguments(obj: any): obj is GetGroupMembersArguments {
  return obj.groupId
}

export function isGetGroupSplitsArguments(obj: any): obj is GetGroupSplitsArguments {
  return obj.groupId
}
