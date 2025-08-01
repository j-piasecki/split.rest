import { DatabaseService } from './database.service'
import { getAllowedSplitTypes } from './database/utils/getAllowedSplitTypes'
import { BadRequestException } from './errors/BadRequestException'
import { deleteProfilePicture, downloadProfilePicture } from './profilePicture'
import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
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
  GetGroupMemberPermissionsArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupMonthlyStatsArguments,
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
  ResolveAllDelayedSplitsAtOnceArguments,
  ResolveDelayedSplitArguments,
  SetAllowedSplitMethodsArguments,
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
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createOrUpdateUser(user: User) {
    await this.databaseService.createOrUpdateUser(user)

    if (user.photoUrl && !fs.existsSync(`public/${user.id}.png`)) {
      try {
        await downloadProfilePicture(user.photoUrl, user.id)
      } catch (error) {
        console.error(`Failed to download profile picture for ${user.id}`, error)
      }
    }
  }

  async createGroup(userId: string, args: CreateGroupArguments) {
    return await this.databaseService.createGroup(userId, args)
  }

  async inviteUser(callerId: string, args: InviteUserToGroupArguments) {
    return await this.databaseService.inviteUser(callerId, args)
  }

  async createSplit(callerId: string, args: CreateSplitArguments) {
    const allowedTypes = await getAllowedSplitTypes(this.databaseService.pool, args.groupId)

    if (allowedTypes === null || !allowedTypes.includes(args.type)) {
      throw new BadRequestException('api.split.invalidSplitType')
    }

    const changeSum = args.balances.reduce((sum, { change }) => sum + Number(change), 0)
    if (Math.abs(changeSum) >= 0.005) {
      throw new BadRequestException('api.split.sumOfChangesMustBeZero')
    }

    if (Number(args.total) < 0.01) {
      throw new BadRequestException('api.split.totalValueMustBePositive')
    }

    return await this.databaseService.createSplit(callerId, args)
  }

  async deleteSplit(callerId: string, args: DeleteSplitArguments) {
    return await this.databaseService.deleteSplit(callerId, args)
  }

  async restoreSplit(callerId: string, args: DeleteSplitArguments) {
    return await this.databaseService.restoreSplit(callerId, args)
  }

  async updateSplit(callerId: string, args: UpdateSplitArguments) {
    const changeSum = args.balances.reduce((sum, { change }) => sum + Number(change), 0)
    if (Math.abs(changeSum) >= 0.005) {
      throw new BadRequestException('api.split.sumOfChangesMustBeZero')
    }
    if (Number(args.total) < 0.01) {
      throw new BadRequestException('api.split.totalValueMustBePositive')
    }

    return await this.databaseService.updateSplit(callerId, args)
  }

  async setGroupAccess(callerId: string, args: SetGroupAccessArguments) {
    return await this.databaseService.setGroupAccess(callerId, args)
  }

  async setGroupAdmin(callerId: string, args: SetGroupAdminArguments) {
    return await this.databaseService.setGroupAdmin(callerId, args)
  }

  async setGroupHidden(callerId: string, args: SetGroupHiddenArguments) {
    return await this.databaseService.setGroupHidden(callerId, args)
  }

  async getGroupMembers(callerId: string, args: GetGroupMembersArguments) {
    return await this.databaseService.getGroupMembers(callerId, args)
  }

  async getGroupSplits(callerId: string, args: GetGroupSplitsArguments) {
    return await this.databaseService.getGroupSplits(callerId, args)
  }

  async queryGroupSplits(callerId: string, args: QueryGroupSplitsArguments) {
    return await this.databaseService.queryGroupSplits(callerId, args)
  }

  async getUserGroups(callerId: string, args: GetUserGroupsArguments) {
    return await this.databaseService.getUserGroups(callerId, args)
  }

  async getUserByEmail(callerId: string, args: GetUserByEmailArguments) {
    return await this.databaseService.getUserByEmail(callerId, args)
  }

  async getUserById(callerId: string, args: GetUserByIdArguments) {
    return await this.databaseService.getUserById(callerId, args)
  }

  async getGroupInfo(callerId: string, args: GetGroupInfoArguments) {
    return await this.databaseService.getGroupInfo(callerId, args)
  }

  async getGroupMembersAutocompletions(
    callerId: string,
    args: GetGroupMembersAutocompletionsArguments
  ) {
    return await this.databaseService.getGroupMembersAutocompletions(callerId, args)
  }

  async getSplitInfo(callerId: string, args: GetSplitInfoArguments) {
    return await this.databaseService.getSplitInfo(callerId, args)
  }

  async getBalances(callerId: string, args: GetBalancesArguments) {
    return await this.databaseService.getBalances(callerId, args)
  }

  async deleteGroup(callerId: string, args: DeleteGroupArguments) {
    return await this.databaseService.deleteGroup(callerId, args)
  }

  async setGroupName(callerId: string, args: SetGroupNameArguments) {
    return await this.databaseService.setGroupName(callerId, args)
  }

  async joinGroupByLink(callerId: string, args: JoinGroupByLinkArguments) {
    return await this.databaseService.joinGroupByLink(callerId, args)
  }

  async getGroupInviteByLink(callerId: string, args: GetGroupInviteByLinkArguments) {
    return await this.databaseService.getGroupInviteByLink(callerId, args)
  }

  async createGroupJoinLink(callerId: string, args: CreateGroupJoinLinkArguments) {
    return await this.databaseService.createGroupJoinLink(callerId, args)
  }

  async deleteGroupJoinLink(callerId: string, args: DeleteGroupJoinLinkArguments) {
    return await this.databaseService.deleteGroupJoinLink(callerId, args)
  }

  async getGroupJoinLink(callerId: string, args: GetGroupJoinLinkArguments) {
    return await this.databaseService.getGroupJoinLink(callerId, args)
  }

  async getSplitHistory(callerId: string, args: GetSplitHistoryArguments) {
    return await this.databaseService.getSplitHistory(callerId, args)
  }

  async getGroupMemberPermissions(callerId: string, args: GetGroupMemberPermissionsArguments) {
    return await this.databaseService.getGroupMemberPermissions(callerId, args)
  }

  async getUserGroupInvites(callerId: string, args: GetUserInvitesArguments) {
    return await this.databaseService.getUserGroupInvites(callerId, args)
  }

  async acceptGroupInvite(callerId: string, args: AcceptGroupInviteArguments) {
    return await this.databaseService.acceptGroupInvite(callerId, args)
  }

  async setGroupInviteRejected(callerId: string, args: SetGroupInviteRejectedArguments) {
    return await this.databaseService.setGroupInviteRejected(callerId, args)
  }

  async deleteUser(callerId: string) {
    try {
      await deleteProfilePicture(callerId)
    } catch {
      // fail silently when profile picture deletion fails
    }

    return await this.databaseService.deleteUser(callerId)
  }

  async getGroupMemberInfo(callerId: string, args: GetGroupMemberInfoArguments) {
    return await this.databaseService.getGroupMemberInfo(callerId, args)
  }

  async getDirectGroupInvites(callerId: string, args: GetDirectGroupInvitesArguments) {
    return await this.databaseService.getDirectGroupInvites(callerId, args)
  }

  async setGroupInviteWithdrawn(callerId: string, args: SetGroupInviteWithdrawnArguments) {
    return await this.databaseService.setGroupInviteWithdrawn(callerId, args)
  }

  async setUserName(callerId: string, args: SetUserNameArguments) {
    return await this.databaseService.setUserName(callerId, args)
  }

  async settleUp(callerId: string, args: SettleUpArguments) {
    return await this.databaseService.settleUp(callerId, args)
  }

  async setUserDisplayName(callerId: string, args: SetUserDisplayNameArguments) {
    return await this.databaseService.setUserDisplayName(callerId, args)
  }

  async registerOrUpdateNotificationToken(
    callerId: string,
    args: RegisterOrUpdateNotificationTokenArguments
  ) {
    return await this.databaseService.registerOrUpdateNotificationToken(callerId, args)
  }

  async unregisterNotificationToken(callerId: string, args: UnregisterNotificationTokenArguments) {
    return await this.databaseService.unregisterNotificationToken(callerId, args)
  }

  async completeSplitEntry(callerId: string, args: CompleteSplitEntryArguments) {
    return await this.databaseService.completeSplitEntry(callerId, args)
  }

  async uncompleteSplitEntry(callerId: string, args: CompleteSplitEntryArguments) {
    return await this.databaseService.uncompleteSplitEntry(callerId, args)
  }

  async getSettleUpPreview(callerId: string, args: SettleUpArguments) {
    return await this.databaseService.getSettleUpPreview(callerId, args)
  }

  async confirmSettleUp(callerId: string, args: ConfirmSettleUpArguments) {
    return await this.databaseService.confirmSettleUp(callerId, args)
  }

  async getSplitParticipantsSuggestions(
    callerId: string,
    args: GetSplitParticipantsSuggestionsArguments
  ) {
    return await this.databaseService.getSplitParticipantsSuggestions(callerId, args)
  }

  async setGroupLocked(callerId: string, args: SetGroupLockedArguments) {
    return await this.databaseService.setGroupLocked(callerId, args)
  }

  async settleUpGroup(callerId: string, args: SettleUpGroupArguments) {
    return await this.databaseService.settleUpGroup(callerId, args)
  }

  async resolveDelayedSplit(callerId: string, args: ResolveDelayedSplitArguments) {
    return await this.databaseService.resolveDelayedSplit(callerId, args)
  }

  async resolveAllDelayedSplitsAtOnce(
    callerId: string,
    args: ResolveAllDelayedSplitsAtOnceArguments
  ) {
    return await this.databaseService.resolveAllDelayedSplitsAtOnce(callerId, args)
  }

  async setGroupAllowedSplitMethods(callerId: string, args: SetAllowedSplitMethodsArguments) {
    return await this.databaseService.setGroupAllowedSplitMethods(callerId, args)
  }

  async getGroupMonthlyStats(callerId: string, args: GetGroupMonthlyStatsArguments) {
    return await this.databaseService.getGroupMonthlyStats(callerId, args)
  }
}
