import { QueryClient } from '@tanstack/react-query'
import { GroupInfo, Member, SplitInfo } from 'shared'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

export async function invalidateGroup(groupId: number) {
  await queryClient.invalidateQueries({ queryKey: ['groupSplits', groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
  await queryClient.invalidateQueries({ queryKey: ['groupInfo', groupId] })
  await invalidateUserGroups()
  await invalidateGroupJoinLink(groupId)
}

export async function invalidateSplitRelatedQueries(groupId: number, splitId: number) {
  await queryClient.invalidateQueries({ queryKey: ['splitHistory', groupId, splitId] })
  await invalidateGroup(groupId)
}

export async function invalidateGroupInfo(groupId: number) {
  await queryClient.invalidateQueries({ queryKey: ['groupInfo', groupId] })
  await invalidateUserGroups()
}

export async function invalidateGroupMembers(groupId: number) {
  await queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] })
}

export async function invalidateUserGroups(hidden?: boolean) {
  if (hidden === undefined) {
    await queryClient.invalidateQueries({ queryKey: ['userGroups'] })
  } else {
    await queryClient.invalidateQueries({ queryKey: ['userGroups', hidden] })
  }
}

export async function invalidateGroupJoinLink(groupId: number) {
  await queryClient.invalidateQueries({ queryKey: ['groupJoinLink', groupId] })
}

export async function addCachedSplit(groupId: number, split: SplitInfo) {
  await queryClient.setQueryData(['groupSplits', groupId], (oldData?: { pages: SplitInfo[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page, index) => (index === 0 ? [split, ...page] : page)),
    }
  })
}

export async function deleteCachedSplit(groupId: number, splitId: number) {
  await queryClient.setQueryData(['groupSplits', groupId], (oldData?: { pages: SplitInfo[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page) => page.filter((split) => split.id !== splitId)),
    }
  })
}

export async function updateCachedGroup(groupId: number, updater: (data: GroupInfo) => GroupInfo) {
  await queryClient.setQueryData(['groupInfo', groupId], (oldData?: GroupInfo) => {
    if (!oldData) {
      return
    }
    return updater(oldData)
  })
}

export async function updateCachedSplit(
  groupId: number,
  splitId: number,
  updater: (data: SplitInfo) => SplitInfo
) {
  await queryClient.setQueryData(['groupSplits', groupId], (oldData?: { pages: SplitInfo[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((split) => (split.id === splitId ? updater(split) : split))
      ),
    }
  })
}

export async function updateCachedGroupMember(
  groupId: number,
  userId: string,
  updater: (data: Member) => Member
) {
  await queryClient.setQueryData(['groupMembers', groupId], (oldData?: { pages: Member[][] }) => {
    if (!oldData) {
      return
    }

    return {
      ...oldData,
      pages: oldData.pages.map((page) =>
        page.map((member) => (member.id === userId ? updater(member) : member))
      ),
    }
  })
}
