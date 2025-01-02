export interface User {
  id: string
  name: string
  email: string
  photoUrl?: string
}

export enum GroupType {
  Normal = 0,
}

export interface GroupMetadata {
  id: number
  name: string
  currency: string
  memberCount: number
  total: string
  owner: string
  type: GroupType
}

export interface GroupInfo extends GroupMetadata {
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

export interface GroupInvite {
  createdBy: User
  groupInfo: GroupMetadata
  createdAt: number
  rejected: boolean
}

export function isUser(obj: any): obj is User {
  return (
    obj.id !== undefined &&
    obj.name !== undefined &&
    obj.email !== undefined &&
    obj.photoUrl !== undefined
  )
}
