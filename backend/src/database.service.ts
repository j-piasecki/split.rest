import { createDatabase } from './database/createDatabase'
import { acceptGroupInvite } from './database/groups/acceptInvite'
import { createGroup } from './database/groups/createGroup'
import { createGroupJoinLink } from './database/groups/createGroupJoinLink'
import { deleteGroup } from './database/groups/deleteGroup'
import { deleteGroupJoinLink } from './database/groups/deleteGroupJoinLink'
import { getBalances } from './database/groups/getBalances'
import { getGroupInfo } from './database/groups/getGroupInfo'
import { getGroupJoinLink } from './database/groups/getGroupJoinLink'
import { getGroupMemberPermissions } from './database/groups/getGroupMemberPermissions'
import { getGroupMembers } from './database/groups/getGroupMembers'
import { getGroupMembersAutocompletions } from './database/groups/getGroupMembersAutocompletions'
import { getGroupMetadataByLink } from './database/groups/getGroupMetadataByLink'
import { getGroupSplits } from './database/groups/getGroupSplits'
import { getUserGroupInvites } from './database/groups/getUserGroupInvites'
import { getUserGroups } from './database/groups/getUserGroups'
import { inviteUser } from './database/groups/inviteUser'
import { joinGroupByLink } from './database/groups/joinGroupByLink'
import { setGroupAccess } from './database/groups/setGroupAccess'
import { setGroupAdmin } from './database/groups/setGroupAdmin'
import { setGroupHidden } from './database/groups/setGroupHidden'
import { setGroupName } from './database/groups/setGroupName'
import { setGroupInviteRejected } from './database/groups/setInviteRejected'
import { RequirePermissions } from './database/permissionCheck'
import { createSplit } from './database/splits/createSplit'
import { deleteSplit } from './database/splits/deleteSplit'
import { getSplitHistory } from './database/splits/getSplitHistory'
import { getSplitInfo } from './database/splits/getSplitInfo'
import { restoreSplit } from './database/splits/restoreSplit'
import { updateSplit } from './database/splits/updateSplit'
import { createOrUpdateUser } from './database/users/createOrUpdateUser'
import { getUserByEmail } from './database/users/getUserByEmail'
import { getUserById } from './database/users/getUserById'
import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import {
  AcceptGroupInviteArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetGroupInfoArguments,
  GetGroupJoinLinkArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupMetadataByLinkArguments,
  GetGroupSplitsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  GetUserInvitesArguments,
  InviteUserToGroupArguments,
  JoinGroupByLinkArguments,
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupInviteRejectedArguments,
  SetGroupNameArguments,
  UpdateSplitArguments,
  User,
} from 'shared'

@Injectable()
export class DatabaseService {
  readonly pool: Pool

  constructor() {
    this.pool = new Pool({
      user: 'postgres',
      password: 'zaq1@WSX',
      host: 'localhost',
      port: 5432,
      database: 'split',
    })

    this.createDatabase()
  }

  private async createDatabase() {
    await createDatabase(this.pool)
  }

  async createOrUpdateUser(user: User) {
    return await createOrUpdateUser(this.pool, user)
  }

  // Every user can create a group
  async createGroup(callerId: string, args: CreateGroupArguments) {
    return await createGroup(this.pool, callerId, args)
  }

  @RequirePermissions(['inviteMembers'])
  async inviteUser(callerId: string, args: InviteUserToGroupArguments) {
    return await inviteUser(this.pool, callerId, args)
  }

  // Every user can create a split in a group they have access to
  // TODO: specific permission for creating splits?
  @RequirePermissions(['createSplit'])
  async createSplit(callerId: string, args: CreateSplitArguments) {
    return await createSplit(this.pool, callerId, args)
  }

  @RequirePermissions(['deleteSplit'])
  async deleteSplit(callerId: string, args: DeleteSplitArguments) {
    return await deleteSplit(this.pool, callerId, args)
  }

  @RequirePermissions(['restoreSplit'])
  async restoreSplit(callerId: string, args: RestoreSplitArguments) {
    return await restoreSplit(this.pool, callerId, args)
  }

  @RequirePermissions(['updateSplit'])
  async updateSplit(callerId: string, args: UpdateSplitArguments) {
    return await updateSplit(this.pool, callerId, args)
  }

  @RequirePermissions(['manageAccess'])
  async setGroupAccess(callerId: string, args: SetGroupAccessArguments) {
    return await setGroupAccess(this.pool, callerId, args)
  }

  @RequirePermissions(['manageAdmins'])
  async setGroupAdmin(callerId: string, args: SetGroupAdminArguments) {
    return await setGroupAdmin(this.pool, callerId, args)
  }

  // Every user can set their own group hidden status
  async setGroupHidden(callerId: string, args: SetGroupHiddenArguments) {
    return await setGroupHidden(this.pool, callerId, args)
  }

  @RequirePermissions(['readSplits'])
  async getGroupSplits(callerId: string, args: GetGroupSplitsArguments) {
    return await getGroupSplits(this.pool, callerId, args)
  }

  // Every user can see their own groups
  async getUserGroups(callerId: string, args: GetUserGroupsArguments) {
    return await getUserGroups(this.pool, callerId, args)
  }

  @RequirePermissions(['readMembers'])
  async getGroupMembers(callerId: string, args: GetGroupMembersArguments) {
    return await getGroupMembers(this.pool, callerId, args)
  }

  // If email is known, every user can get user info
  async getUserByEmail(callerId: string, args: GetUserByEmailArguments) {
    return await getUserByEmail(this.pool, callerId, args)
  }

  // If id is known, every user can get user info
  async getUserById(callerId: string, args: GetUserByIdArguments) {
    return await getUserById(this.pool, callerId, args)
  }

  @RequirePermissions(['beGroupMember'])
  async getGroupInfo(callerId: string, args: GetGroupInfoArguments) {
    return await getGroupInfo(this.pool, callerId, args)
  }

  @RequirePermissions(['readMembers'])
  async getGroupMembersAutocompletions(
    callerId: string,
    args: GetGroupMembersAutocompletionsArguments
  ) {
    return await getGroupMembersAutocompletions(this.pool, callerId, args)
  }

  // TODO: allow to see split if user has no access but is a participant?
  @RequirePermissions(['seeSplitDetails'])
  async getSplitInfo(callerId: string, args: GetSplitInfoArguments) {
    return await getSplitInfo(this.pool, callerId, args)
  }

  @RequirePermissions(['accessRoulette'])
  async getBalances(callerId: string, args: GetBalancesArguments) {
    return await getBalances(this.pool, callerId, args)
  }

  @RequirePermissions(['deleteGroup'])
  async deleteGroup(callerId: string, args: DeleteGroupArguments) {
    return await deleteGroup(this.pool, callerId, args)
  }

  @RequirePermissions(['renameGroup'])
  async setGroupName(callerId: string, args: SetGroupNameArguments) {
    return await setGroupName(this.pool, callerId, args)
  }

  // Every user can join a group by link if they have it
  async joinGroupByLink(callerId: string, args: JoinGroupByLinkArguments) {
    return await joinGroupByLink(this.pool, callerId, args)
  }

  // Every user can get group metadata by link if they have it
  async getGroupMetadataByLink(args: GetGroupMetadataByLinkArguments) {
    return await getGroupMetadataByLink(this.pool, args)
  }

  @RequirePermissions(['createJoinLink'])
  async createGroupJoinLink(callerId: string, args: CreateGroupJoinLinkArguments) {
    return await createGroupJoinLink(this.pool, callerId, args)
  }

  @RequirePermissions(['deleteJoinLink'])
  async deleteGroupJoinLink(callerId: string, args: DeleteGroupJoinLinkArguments) {
    return await deleteGroupJoinLink(this.pool, callerId, args)
  }

  @RequirePermissions(['seeJoinLink'])
  async getGroupJoinLink(callerId: string, args: GetGroupJoinLinkArguments) {
    return await getGroupJoinLink(this.pool, callerId, args)
  }

  @RequirePermissions(['seeSplitDetails'])
  async getSplitHistory(callerId: string, args: GetSplitHistoryArguments) {
    return await getSplitHistory(this.pool, callerId, args)
  }

  @RequirePermissions(['readPermissions'])
  async getGroupMemberPermissions(callerId: string, args: GetGroupMembersArguments) {
    return await getGroupMemberPermissions(this.pool, callerId, args)
  }

  // Every user can see their own group invites
  async getUserGroupInvites(callerId: string, args: GetUserInvitesArguments) {
    return await getUserGroupInvites(this.pool, callerId, args)
  }

  // Every user can accept a group invite
  async acceptGroupInvite(callerId: string, args: AcceptGroupInviteArguments) {
    return await acceptGroupInvite(this.pool, callerId, args)
  }

  // Every user can ignore a group invite
  async setGroupInviteRejected(callerId: string, args: SetGroupInviteRejectedArguments) {
    return await setGroupInviteRejected(this.pool, callerId, args)
  }
}
