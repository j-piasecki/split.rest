export const PermissionToFieldMap = {
  createGroup: [] as const,
  accessGroup: ['groupId'] as const,
  getGroupInfo: ['groupId'] as const,
  manageGroup: ['groupId'] as const,
  deleteGroup: ['groupId'] as const,
  createSplit: ['groupId'] as const,
  deleteSplit: ['groupId', 'splitId'] as const,
  restoreSplit: ['groupId', 'splitId'] as const,
  editSplit: ['groupId', 'splitId'] as const,
}

export type PermissionToFieldMap = typeof PermissionToFieldMap

type ObjectFromArray<T extends (keyof PermissionToFieldMap)[]> = {
  [K in T[number] as PermissionToFieldMap[K][number]]: Exclude<any, undefined | null>
}

export type PermissionArguments<T extends (keyof PermissionToFieldMap)[]> = ObjectFromArray<T>
