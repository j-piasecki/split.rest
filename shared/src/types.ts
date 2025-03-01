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
  displayName: string | null
}

export interface UserWithDisplayName extends User {
  displayName: string
}

export interface BalanceChange {
  id: string
  change: string
}

export interface UserWithBalanceChange extends User {
  change: string
}

export enum SplitType {
  // Change of payer balance should be positive, others negative
  Normal = 0,
  // Change of payer balance should be negative, others positive.
  // The only way to create this split is to settle up with a positive balance.
  Inversed = 1 << 0,
  // Split is a settle up split
  SettleUp = 1 << 1,
  // There is no single payer or recipient, there may be multiple payers and recipients.
  // Sum of all changes should be 0.
  BalanceChange = 1 << 2,
}

export interface SplitInfo {
  id: number
  title: string
  total: string
  timestamp: number
  paidById?: string
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
  createdAt: number
  rejected: boolean
  withdrawn: boolean
}

export interface GroupInviteWithGroupInfo extends GroupInvite {
  groupInfo: GroupInfo
}

export interface GroupInviteWithInvitee extends GroupInvite {
  invitee: User
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
