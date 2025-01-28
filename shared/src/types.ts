export interface User {
  id: string
  name: string
  email: string | null
  photoUrl: string | null
  deleted: boolean
}

export enum GroupType {
  Normal = 0,
}

export interface GroupInfo {
  id: number
  name: string
  currency: string
  memberCount: number
  total: string
  owner: string
  type: GroupType
}

export interface GroupUserInfo extends GroupInfo {
  isAdmin: boolean
  hasAccess: boolean
  hidden: boolean
  balance: string
}

export interface Member extends User {
  balance: string
  isAdmin: boolean
  hasAccess: boolean
}

export interface BalanceChange {
  id: string
  change: string
}

export interface UserWithBalanceChange extends User {
  change: string
}

export enum SplitType {
  Normal = 0,
}

export interface SplitInfo {
  id: number
  title: string
  total: string
  timestamp: number
  paidById: string
  createdById: string
  version: number
  updatedAt: number
  type: SplitType
  isUserParticipating: boolean
}

export interface SplitWithChanges extends SplitInfo {
  changes: BalanceChange[]
}

export interface SplitWithUsers extends SplitInfo {
  users: UserWithBalanceChange[]
}

export interface GroupJoinLink {
  uuid: string
  groupId: number
  createdById: string
  createdAt: number
}

export interface GroupInviteWithGroupInfo {
  createdBy: User
  groupInfo: GroupInfo
  createdAt: number
  rejected: boolean
  withdrawn: boolean
}

export function isUser(obj: any): obj is User {
  return (
    obj.id !== undefined &&
    obj.name !== undefined &&
    obj.email !== undefined &&
    obj.photoUrl !== undefined &&
    obj.deleted !== undefined
  )
}
