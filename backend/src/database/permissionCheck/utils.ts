import { PermissionKeys } from 'shared'

export const ExtendedPermissionKeys = [...PermissionKeys, 'beGroupMember'] as const

export const PermissionToFieldMap = {
  beGroupMember: ['groupId'] as const,
  createSplit: ['groupId'] as const,
  querySplits: ['groupId'] as const,
  seeSplitDetails: ['groupId', 'splitId'] as const,
  updateSplit: ['groupId', 'splitId'] as const,
  deleteSplit: ['groupId', 'splitId'] as const,
  restoreSplit: ['groupId', 'splitId'] as const,
  completeSplitEntry: ['groupId', 'splitId', 'userId'] as const,
  uncompleteSplitEntry: ['groupId', 'splitId', 'userId'] as const,
  resolveDelayedSplits: ['groupId', 'splitId'] as const,
  resolveAllDelayedSplitsAtOnce: ['groupId'] as const,
  accessRoulette: ['groupId'] as const,
  settleUp: ['groupId'] as const,
  readMembers: ['groupId'] as const,
  inviteMembers: ['groupId'] as const,
  removeMembers: ['groupId', 'userId'] as const,
  renameGroup: ['groupId'] as const,
  deleteGroup: ['groupId'] as const,
  seeJoinLink: ['groupId'] as const,
  createJoinLink: ['groupId'] as const,
  deleteJoinLink: ['groupId'] as const,
  manageAccess: ['groupId'] as const,
  manageAdmins: ['groupId'] as const,
  readPermissions: ['groupId', 'userId?'] as const,
  managePermissions: ['groupId'] as const,
  manageDirectInvites: ['groupId', 'onlyIfCreated?'] as const,
  manageAllDirectInvites: ['groupId'] as const,
  changeDisplayName: ['groupId', 'userId'] as const,
  lockGroup: ['groupId'] as const,
  settleUpGroup: ['groupId'] as const,
  manageAllowedSplitMethods: ['groupId'] as const,
  seeGroupTrends: ['groupId'] as const,
  manageGroupIcon: ['groupId'] as const,
}

export type PermissionToFieldMap = {
  [K in (typeof ExtendedPermissionKeys)[number]]: readonly (typeof PermissionToFieldMap)[K][number][]
}

type EndsWithOptional<T> = T extends `${infer _Rest}?` ? true : false
type RemoveOptional<T> = T extends `${infer Rest}?` ? Rest : T

type ObjectFromArray<T extends (keyof PermissionToFieldMap)[]> = {
  [K in T[number] as RemoveOptional<
    PermissionToFieldMap[K][number]
  >]: EndsWithOptional<K> extends true ? Exclude<any, null> : Exclude<any, null | undefined>
}

export type PermissionArguments<T extends (keyof PermissionToFieldMap)[]> = ObjectFromArray<T>
