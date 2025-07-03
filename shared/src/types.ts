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
  displayName: string | null
}

export interface BalanceChange {
  id: string
  change: string
  pending: boolean
}

export interface UserWithBalanceChange extends UserWithDisplayName {
  change: string
}

export interface UserWithPendingBalanceChange extends UserWithBalanceChange {
  change: string
  pending: boolean
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

export enum AndroidNotificationChannel {
  NewSplits = 'new-splits',
  SplitUpdates = 'split-updates',
  GroupInvites = 'group-invites',
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
  pending: boolean
  userChange?: string
}

export interface SplitQuery {
  title?:
    | { type: 'contains'; filter: string; caseSensitive: boolean }
    | { type: 'regex'; filter: string; caseSensitive: boolean }
  participants?: { type: 'all'; ids: string[] } | { type: 'oneOf'; ids: string[] }
  orderBy?: 'timestamp' | 'createdAt' | 'total' | 'balanceChange' | 'updatedAt'
  orderDirection?: 'asc' | 'desc'
  targetUser?: string
  paidBy?: string[]
  lastUpdateBy?: string[]
  beforeTimestamp?: number
  afterTimestamp?: number
  lastUpdateBeforeTimestamp?: number
  lastUpdateAfterTimestamp?: number
  // undefined is all, true is edited, false is not edited
  edited?: boolean
  pending?: boolean
}

export interface SplitWithChanges extends SplitInfo {
  changes: BalanceChange[]
}

export interface SplitWithUsers extends SplitInfo {
  users: UserWithPendingBalanceChange[]
}

export interface SplitWithHashedChanges extends SplitWithUsers {
  entriesHash: string
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
  alreadyAMember: boolean
}

export interface GroupInviteWithGroupInfo extends GroupInvite {
  groupInfo: GroupInfo
}

export interface GroupInviteWithGroupInfoAndMemberIds extends GroupInviteWithGroupInfo {
  memberIds: string[]
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
