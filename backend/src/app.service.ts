import { DatabaseService } from './database.service'
import { BadRequestException } from './errors/BadRequestException'
import { downloadProfilePicture } from './profilePicture'
import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import {
  AddUserToGroupArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetGroupInfoArguments,
  GetGroupJoinLinkArguments,
  GetGroupMemberPermissionsArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupMetadataByLinkArguments,
  GetGroupSplitsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  JoinGroupByLinkArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupNameArguments,
  UpdateSplitArguments,
  User,
} from 'shared'

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createOrUpdateUser(user: User) {
    const result = await this.databaseService.createOrUpdateUser(user)

    if (result.photoUrlUpdated || !fs.existsSync(`public/${user.id}.png`)) {
      try {
        await downloadProfilePicture(user.photoUrl, user.id)
      } catch (error) {
        console.error(`Failed to download profile picture for ${user.id}`, error)
      }
    }

    return result
  }

  async createGroup(userId: string, args: CreateGroupArguments) {
    return await this.databaseService.createGroup(userId, args)
  }

  async addUserToGroup(callerId: string, args: AddUserToGroupArguments) {
    return await this.databaseService.addUserToGroup(callerId, args)
  }

  async createSplit(callerId: string, args: CreateSplitArguments) {
    if (args.balances.findIndex(({ id }) => id === args.paidBy) === -1) {
      throw new BadRequestException('api.split.payerNotInTransaction')
    }

    const changeSum = args.balances.reduce((sum, { change }) => sum + change, 0)
    if (Math.abs(changeSum) > 0.01) {
      throw new BadRequestException('api.split.sumOfChangesMustBeZero')
    }

    const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
    const othersLose = args.balances.reduce(
      (sum, { id, change }) => (id !== args.paidBy ? sum + change : sum),
      0
    )

    if (payerGetsBack && Math.abs(payerGetsBack - Math.abs(othersLose)) > 0.01) {
      throw new BadRequestException('api.split.payerMustGetBackSumOthersLose')
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
    if (args.balances.findIndex(({ id }) => id === args.paidBy) === -1) {
      throw new BadRequestException('api.split.payerNotInTransaction')
    }

    const changeSum = args.balances.reduce((sum, { change }) => sum + change, 0)
    if (Math.abs(changeSum) > 0.01) {
      throw new BadRequestException('api.split.sumOfChangesMustBeZero')
    }

    const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
    const othersLose = args.balances.reduce(
      (sum, { id, change }) => (id !== args.paidBy ? sum + change : sum),
      0
    )

    if (payerGetsBack && Math.abs(payerGetsBack - Math.abs(othersLose)) > 0.01) {
      throw new BadRequestException('api.split.payerMustGetBackSumOthersLose')
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

  async getGroupMetadataByLink(args: GetGroupMetadataByLinkArguments) {
    return await this.databaseService.getGroupMetadataByLink(args)
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
}
