import { createDatabase } from './database/createDatabase'
import { acceptGroupInvite } from './database/groups/acceptInvite'
import { createGroup } from './database/groups/createGroup'
import { createGroupJoinLink } from './database/groups/createGroupJoinLink'
import { deleteGroup } from './database/groups/deleteGroup'
import { deleteGroupJoinLink } from './database/groups/deleteGroupJoinLink'
import { getBalances } from './database/groups/getBalances'
import { getDirectGroupInvites } from './database/groups/getDirectGroupInvites'
import { getGroupInfo } from './database/groups/getGroupInfo'
import { getGroupInviteByLink } from './database/groups/getGroupInviteByLink'
import { getGroupJoinLink } from './database/groups/getGroupJoinLink'
import { getGroupMemberPermissions } from './database/groups/getGroupMemberPermissions'
import { getGroupMembers } from './database/groups/getGroupMembers'
import { getGroupMembersAutocompletions } from './database/groups/getGroupMembersAutocompletions'
import { getGroupSplits } from './database/groups/getGroupSplits'
import { getMemberInfo } from './database/groups/getMemberInfo'
import { getSplitParticipantsSuggestions } from './database/groups/getSplitParticipantsSuggestions'
import { getUserGroupInvites } from './database/groups/getUserGroupInvites'
import { getUserGroups } from './database/groups/getUserGroups'
import { inviteUser } from './database/groups/inviteUser'
import { joinGroupByLink } from './database/groups/joinGroupByLink'
import { queryGroupSplits } from './database/groups/queryGroupSplits'
import { setGroupAccess } from './database/groups/setGroupAccess'
import { setGroupAdmin } from './database/groups/setGroupAdmin'
import { setGroupHidden } from './database/groups/setGroupHidden'
import { setGroupLocked } from './database/groups/setGroupLocked'
import { setGroupName } from './database/groups/setGroupName'
import { setGroupInviteRejected } from './database/groups/setInviteRejected'
import { setGroupInviteWithdrawn } from './database/groups/setInviteWithdrawn'
import { setUserDisplayName } from './database/groups/setUserDisplayName'
import { settleUpGroup } from './database/groups/settleUpGroup'
import { RequirePermissions } from './database/permissionCheck'
import { completeSplitEntry } from './database/splits/completeSplitEntry'
import { confirmSettleUp } from './database/splits/confirmSettleUp'
import { createSplit } from './database/splits/createSplit'
import { deleteSplit } from './database/splits/deleteSplit'
import { getSettleUpPreview } from './database/splits/getSettleUpPreview'
import { getSplitHistory } from './database/splits/getSplitHistory'
import { getSplitInfo } from './database/splits/getSplitInfo'
import { restoreSplit } from './database/splits/restoreSplit'
import { settleUp } from './database/splits/settleUp'
import { uncompleteSplitEntry } from './database/splits/uncompleteSplitEntry'
import { updateSplit } from './database/splits/updateSplit'
import { createOrUpdateUser } from './database/users/createOrUpdateUser'
import { deleteUser } from './database/users/deleteUser'
import { getUserByEmail } from './database/users/getUserByEmail'
import { getUserById } from './database/users/getUserById'
import { registerOrUpdateNotificationToken } from './database/users/registerOrUpdateNotificationToken'
import { setUserName } from './database/users/setUserName'
import { unregisterNotificationToken } from './database/users/unregisterNotificationToken'
import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import {
  AcceptGroupInviteArguments,
  CompleteSplitEntryArguments,
  ConfirmSettleUpArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetDirectGroupInvitesArguments,
  GetGroupInfoArguments,
  GetGroupInviteByLinkArguments,
  GetGroupJoinLinkArguments,
  GetGroupMemberInfoArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupSplitsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetSplitParticipantsSuggestionsArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  GetUserInvitesArguments,
  InviteUserToGroupArguments,
  JoinGroupByLinkArguments,
  QueryGroupSplitsArguments,
  RegisterOrUpdateNotificationTokenArguments,
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupInviteRejectedArguments,
  SetGroupInviteWithdrawnArguments,
  SetGroupLockedArguments,
  SetGroupNameArguments,
  SetUserDisplayNameArguments,
  SetUserNameArguments,
  SettleUpArguments,
  SettleUpGroupArguments,
  UnregisterNotificationTokenArguments,
  UpdateSplitArguments,
  User,
} from 'shared'

@Injectable()
export class DatabaseService {
  readonly pool: Pool

  constructor() {
    this.pool = new Pool({
      user: process.env.SPLIT_USER,
      password: process.env.SPLIT_PASSWORD,
      host: process.env.SPLIT_HOST,
      port: Number(process.env.SPLIT_PORT),
      database: process.env.SPLIT_DATABASE,
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

  @RequirePermissions(['querySplits'])
  async queryGroupSplits(callerId: string, args: QueryGroupSplitsArguments) {
    return await queryGroupSplits(this.pool, callerId, args)
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

  // Permissions are checked in the function
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

  // Every user can get group info by link if they have it
  async getGroupInviteByLink(callerId: string, args: GetGroupInviteByLinkArguments) {
    return await getGroupInviteByLink(this.pool, callerId, args)
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

  // Every user can delete their own account
  async deleteUser(callerId: string) {
    return await deleteUser(this.pool, callerId)
  }

  @RequirePermissions(['readMembers'])
  async getGroupMemberInfo(callerId: string, args: GetGroupMemberInfoArguments) {
    return await getMemberInfo(this.pool, callerId, args)
  }

  @RequirePermissions(['manageDirectInvites'])
  async getDirectGroupInvites(callerId: string, args: GetDirectGroupInvitesArguments) {
    return await getDirectGroupInvites(this.pool, callerId, args)
  }

  @RequirePermissions(['manageDirectInvites'])
  async setGroupInviteWithdrawn(callerId: string, args: SetGroupInviteWithdrawnArguments) {
    return await setGroupInviteWithdrawn(this.pool, callerId, args)
  }

  // Every user can set their own name
  async setUserName(callerId: string, args: SetUserNameArguments) {
    return await setUserName(this.pool, callerId, args)
  }

  @RequirePermissions(['settleUp'])
  async settleUp(callerId: string, args: SettleUpArguments) {
    return await settleUp(this.pool, callerId, args)
  }

  @RequirePermissions(['changeDisplayName'])
  async setUserDisplayName(callerId: string, args: SetUserDisplayNameArguments) {
    return await setUserDisplayName(this.pool, callerId, args)
  }

  // Every user can update their notification token
  async registerOrUpdateNotificationToken(
    callerId: string,
    args: RegisterOrUpdateNotificationTokenArguments
  ) {
    return await registerOrUpdateNotificationToken(this.pool, callerId, args)
  }

  // Every user can delete their notification token
  async unregisterNotificationToken(callerId: string, args: UnregisterNotificationTokenArguments) {
    return await unregisterNotificationToken(this.pool, callerId, args)
  }

  @RequirePermissions(['completeSplitEntry'])
  async completeSplitEntry(callerId: string, args: CompleteSplitEntryArguments) {
    return await completeSplitEntry(this.pool, callerId, args)
  }

  @RequirePermissions(['uncompleteSplitEntry'])
  async uncompleteSplitEntry(callerId: string, args: CompleteSplitEntryArguments) {
    return await uncompleteSplitEntry(this.pool, callerId, args)
  }

  @RequirePermissions(['settleUp'])
  async getSettleUpPreview(callerId: string, args: SettleUpArguments) {
    return await getSettleUpPreview(this.pool, callerId, args)
  }

  @RequirePermissions(['settleUp'])
  async confirmSettleUp(callerId: string, args: ConfirmSettleUpArguments) {
    return await confirmSettleUp(this.pool, callerId, args)
  }

  @RequirePermissions(['readMembers'])
  async getSplitParticipantsSuggestions(
    callerId: string,
    args: GetSplitParticipantsSuggestionsArguments
  ) {
    return await getSplitParticipantsSuggestions(this.pool, callerId, args)
  }

  @RequirePermissions(['lockGroup'])
  async setGroupLocked(callerId: string, args: SetGroupLockedArguments) {
    return await setGroupLocked(this.pool, callerId, args)
  }

  @RequirePermissions(['settleUpGroup'])
  async settleUpGroup(callerId: string, args: SettleUpGroupArguments) {
    return await settleUpGroup(this.pool, callerId, args)
  }
}
