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
