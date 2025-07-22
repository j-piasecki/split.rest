import { Client, Pool, PoolClient } from 'pg'
import {
  GroupMemberPermissions,
  GroupMemberPermissionsDTO,
  ManagePermissionsDTO,
  MembersPermissionsDTO,
  SplitPermissionsDTO,
} from 'shared'

const ownerPermissions: GroupMemberPermissionsDTO = {
  splits:
    SplitPermissionsDTO.Create |
    SplitPermissionsDTO.Read |
    SplitPermissionsDTO.ReadAll |
    SplitPermissionsDTO.SeeDetails |
    SplitPermissionsDTO.SeeDetailsAll |
    SplitPermissionsDTO.Update |
    SplitPermissionsDTO.UpdateAll |
    SplitPermissionsDTO.Delete |
    SplitPermissionsDTO.DeleteAll |
    SplitPermissionsDTO.Restore |
    SplitPermissionsDTO.RestoreAll |
    SplitPermissionsDTO.AccessRoulette |
    SplitPermissionsDTO.SettleUp |
    SplitPermissionsDTO.CompleteSplitEntry |
    SplitPermissionsDTO.UncompleteSplitEntry |
    SplitPermissionsDTO.ResolveDelayedSplits |
    SplitPermissionsDTO.ResolveDelayedSplitsAll |
    // TODO: re-enable once delayed splits are ready
    // SplitPermissionsDTO.ResolveAllDelayedSplitsAtOnce |
    SplitPermissionsDTO.Query,
  members: MembersPermissionsDTO.Read | MembersPermissionsDTO.Invite,
  manage:
    ManagePermissionsDTO.Rename |
    ManagePermissionsDTO.Delete |
    ManagePermissionsDTO.SeeJoinLink |
    ManagePermissionsDTO.CreateJoinLink |
    ManagePermissionsDTO.DeleteJoinLink |
    ManagePermissionsDTO.ManageAccess |
    ManagePermissionsDTO.ManageAdmins |
    ManagePermissionsDTO.ReadPermissions |
    ManagePermissionsDTO.ManagePermissions |
    ManagePermissionsDTO.ManageDirectInvites |
    ManagePermissionsDTO.ManageAllDirectInvites |
    ManagePermissionsDTO.ChangeDisplayName |
    ManagePermissionsDTO.ChangeEveryoneDisplayName |
    ManagePermissionsDTO.LockGroup |
    ManagePermissionsDTO.SettleUpGroup |
    ManagePermissionsDTO.ManageAllowedSplitMethods,
} as const

const adminPermissions: GroupMemberPermissionsDTO = {
  splits:
    SplitPermissionsDTO.Create |
    SplitPermissionsDTO.Read |
    SplitPermissionsDTO.ReadAll |
    SplitPermissionsDTO.SeeDetails |
    SplitPermissionsDTO.SeeDetailsAll |
    SplitPermissionsDTO.Update |
    SplitPermissionsDTO.UpdateAll |
    SplitPermissionsDTO.Delete |
    SplitPermissionsDTO.DeleteAll |
    SplitPermissionsDTO.Restore |
    SplitPermissionsDTO.RestoreAll |
    SplitPermissionsDTO.AccessRoulette |
    SplitPermissionsDTO.SettleUp |
    SplitPermissionsDTO.CompleteSplitEntry |
    SplitPermissionsDTO.UncompleteSplitEntry |
    SplitPermissionsDTO.ResolveDelayedSplits |
    SplitPermissionsDTO.ResolveDelayedSplitsAll |
    SplitPermissionsDTO.Query,
  members: MembersPermissionsDTO.Read | MembersPermissionsDTO.Invite,
  manage:
    ManagePermissionsDTO.Rename |
    ManagePermissionsDTO.SeeJoinLink |
    ManagePermissionsDTO.CreateJoinLink |
    ManagePermissionsDTO.DeleteJoinLink |
    ManagePermissionsDTO.ManageAccess |
    ManagePermissionsDTO.ManageAdmins |
    ManagePermissionsDTO.ReadPermissions |
    ManagePermissionsDTO.ManagePermissions |
    ManagePermissionsDTO.ManageDirectInvites |
    ManagePermissionsDTO.ManageAllDirectInvites |
    ManagePermissionsDTO.ChangeDisplayName |
    ManagePermissionsDTO.ChangeEveryoneDisplayName,
} as const

const memberPermissions: GroupMemberPermissionsDTO = {
  splits:
    SplitPermissionsDTO.Create |
    SplitPermissionsDTO.Read |
    SplitPermissionsDTO.ReadAll |
    SplitPermissionsDTO.SeeDetails |
    SplitPermissionsDTO.SeeDetailsAll |
    SplitPermissionsDTO.Update |
    SplitPermissionsDTO.Delete |
    SplitPermissionsDTO.AccessRoulette |
    SplitPermissionsDTO.SettleUp |
    SplitPermissionsDTO.CompleteSplitEntry |
    SplitPermissionsDTO.UncompleteSplitEntry |
    SplitPermissionsDTO.ResolveDelayedSplits |
    SplitPermissionsDTO.Query,
  members: MembersPermissionsDTO.Read,
  manage: ManagePermissionsDTO.ChangeDisplayName,
} as const

const noPermissions: GroupMemberPermissionsDTO = {
  splits: SplitPermissionsDTO.None,
  members: MembersPermissionsDTO.None,
  manage: ManagePermissionsDTO.None,
} as const

export async function getMemberPermissions(
  client: Pool | PoolClient | Client,
  groupId: number,
  userId: string
): Promise<GroupMemberPermissions | null> {
  const info = (
    await client.query<{ has_access: boolean; is_admin: boolean; is_owner: boolean }>(
      `
      SELECT 
        groups.owner = $2 AS is_owner,
        group_members.has_access, 
        group_members.is_admin 
      FROM group_members INNER JOIN groups ON group_members.group_id = groups.id 
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, userId]
    )
  ).rows[0]

  if (!info) {
    return null
  }

  if (info.is_owner) {
    return new GroupMemberPermissions(
      ownerPermissions.splits,
      ownerPermissions.members,
      ownerPermissions.manage
    )
  }

  if (info.is_admin) {
    return new GroupMemberPermissions(
      adminPermissions.splits,
      adminPermissions.members,
      adminPermissions.manage
    )
  }

  if (info.has_access) {
    return new GroupMemberPermissions(
      memberPermissions.splits,
      memberPermissions.members,
      memberPermissions.manage
    )
  }

  return new GroupMemberPermissions(
    noPermissions.splits,
    noPermissions.members,
    noPermissions.manage
  )
}
