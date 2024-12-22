import { PermissionKeys } from 'shared'

export const ExtendedPermissionKeys = [...PermissionKeys, 'beGroupMember'] as const

export const PermissionToFieldMap = {
  beGroupMember: ['groupId'] as const,
  createSplit: ['groupId'] as const,
  readSplits: ['groupId', 'onlyIfIncluded?'] as const,
  seeSplitDetails: ['groupId', 'splitId'] as const,
  updateSplit: ['groupId', 'splitId'] as const,
  deleteSplit: ['groupId', 'splitId'] as const,
  restoreSplit: ['groupId', 'splitId'] as const,
  readMembers: ['groupId'] as const,
  addMembers: ['groupId'] as const,
  renameGroup: ['groupId'] as const,
  deleteGroup: ['groupId'] as const,
  seeJoinLink: ['groupId'] as const,
  createJoinLink: ['groupId'] as const,
  deleteJoinLink: ['groupId'] as const,
  manageAccess: ['groupId'] as const,
  manageAdmins: ['groupId'] as const,
  readPermissions: ['groupId', 'userId?'] as const,
  managePermissions: ['groupId'] as const,
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
