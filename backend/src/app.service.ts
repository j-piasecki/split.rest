import { DatabaseService } from './database.service'
import { downloadProfilePicture } from './profilePicture'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as fs from 'fs'
import {
  AddUserToGroupArguments,
  CreateGroupArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetGroupInfoArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupSplitsArguments,
  GetSplitInfoArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
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
      throw new BadRequestException('Payer must be in the transaction')
    }

    const changeSum = args.balances.reduce((sum, { change }) => sum + change, 0)
    if (Math.abs(changeSum) > 0.01) {
      throw new BadRequestException('Sum of changes must be 0')
    }

    const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
    const othersLose = args.balances.reduce(
      (sum, { id, change }) => (id !== args.paidBy ? sum + change : sum),
      0
    )

    if (Math.abs(payerGetsBack - Math.abs(othersLose)) > 0.01) {
      throw new BadRequestException('Payer must get back equal amount as sum others lose')
    }

    if (Number(args.total) < 0.01) {
      throw new BadRequestException('Total must be greater than 0')
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
      throw new BadRequestException('Payer must be in the transaction')
    }

    const changeSum = args.balances.reduce((sum, { change }) => sum + change, 0)
    if (Math.abs(changeSum) > 0.01) {
      throw new BadRequestException('Sum of changes must be 0')
    }

    const payerGetsBack = args.balances.find(({ id }) => id === args.paidBy)?.change
    const othersLose = args.balances.reduce(
      (sum, { id, change }) => (id !== args.paidBy ? sum + change : sum),
      0
    )

    if (Math.abs(payerGetsBack - Math.abs(othersLose)) > 0.01) {
      throw new BadRequestException('Payer must get back equal amount as sum others lose')
    }

    if (Number(args.total) < 0.01) {
      throw new BadRequestException('Total must be greater than 0')
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
}
