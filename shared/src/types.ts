import { GroupMemberPermissions } from './permissions'

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
  lastUpdate: number
  locked: boolean
  icon: string | null
}

export interface GroupUserInfo extends GroupInfo {
  isAdmin: boolean
  hasAccess: boolean
  hidden: boolean
  balance: string
  allowedSplitMethods: SplitMethod[]
  permissions: GroupMemberPermissions
}

export interface Member extends User {
  balance: string
  isAdmin: boolean
  hasAccess: boolean
  displayName: string | null
}

export interface MaybeMember extends User {
  balance: string | null
  isAdmin: boolean | null
  hasAccess: boolean | null
  displayName: string | null
}

export interface BalanceChange {
  id: string
  change: string
  pending: boolean
}

export interface MaybeMemberWithBalanceChange extends MaybeMember {
  change: string
}

export interface MaybeMemberWithPendingBalanceChange extends MaybeMemberWithBalanceChange {
  change: string
  pending: boolean
}

export enum SplitMethod {
  ExactAmounts = 'exactAmounts',
  Equal = 'equal',
  BalanceChanges = 'balanceChanges',
  Lend = 'lend',
  Delayed = 'delayed',
  Shares = 'shares',
}

// Remember to update defaultQueryConfig in when adding new split types
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
  // Same as the normal split, but allows the payer contribution to be zero.
  Lend = 1 << 3,
  // Split is created with no participants. It can be resolved later.
  Delayed = 1 << 4,
}

export function isNormalSplit(type: SplitType) {
  return type === SplitType.Normal
}

export function isInversedSplit(type: SplitType) {
  return (type & SplitType.Inversed) !== 0
}

export function isSettleUpSplit(type: SplitType) {
  return (type & SplitType.SettleUp) !== 0
}

export function isBalanceChangeSplit(type: SplitType) {
  return type === SplitType.BalanceChange
}

export function isLendSplit(type: SplitType) {
  return type === SplitType.Lend
}

export function isDelayedSplit(type: SplitType) {
  return type === SplitType.Delayed
}

export enum AndroidNotificationChannel {
  NewSplits = 'new-splits',
  SplitUpdates = 'split-updates',
  GroupInvites = 'group-invites',
  GroupUpdates = 'group-updates',
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
  pendingChange?: string
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
  splitTypes?: SplitType[]
}

export interface SplitWithChanges extends SplitInfo {
  changes: BalanceChange[]
}

export interface SplitWithUsers extends SplitInfo {
  users: MaybeMemberWithPendingBalanceChange[]
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

export interface GroupMonthlyStats {
  stats: Array<{
    startTimestamp: number
    totalValue: string
    transactionCount: number
  }>
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
