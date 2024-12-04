import { addUserToGroup } from './database/addUserToGroup'
import { createDatabase } from './database/createDatabase'
import { createGroup } from './database/createGroup'
import { createOrUpdateUser } from './database/createOrUpdateUser'
import { createSplit } from './database/createSplit'
import { deleteSplit } from './database/deleteSplit'
import { getBalances } from './database/getBalances'
import { getGroupInfo } from './database/getGroupInfo'
import { getGroupMembers } from './database/getGroupMembers'
import { getGroupMembersAutocompletions } from './database/getGroupMembersAutocompletions'
import { getGroupSplits } from './database/getGroupSplits'
import { getSplitInfo } from './database/getSplitInfo'
import { getUserByEmail } from './database/getUserByEmail'
import { getUserById } from './database/getUserById'
import { getUserGroups } from './database/getUserGroups'
import { restoreSplit } from './database/restoreSplit'
import { setGroupAccess } from './database/setGroupAccess'
import { setGroupAdmin } from './database/setGroupAdmin'
import { setGroupHidden } from './database/setGroupHidden'
import { updateSplit } from './database/updateSplit'
import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import {
  AddUserToGroupArguments,
  CreateGroupArguments,
  CreateSplitArguments,
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
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  UpdateSplitArguments,
  User,
} from 'shared'

@Injectable()
export class DatabaseService {
  private pool: Pool

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

  async createGroup(userId: string, args: CreateGroupArguments) {
    return await createGroup(this.pool, userId, args)
  }

  async addUserToGroup(callerId: string, args: AddUserToGroupArguments) {
    return await addUserToGroup(this.pool, callerId, args)
  }

  async createSplit(callerId: string, args: CreateSplitArguments) {
    return await createSplit(this.pool, callerId, args)
  }

  async deleteSplit(callerId: string, args: DeleteSplitArguments) {
    return await deleteSplit(this.pool, callerId, args)
  }

  async restoreSplit(callerId: string, args: RestoreSplitArguments) {
    return await restoreSplit(this.pool, callerId, args)
  }

  async updateSplit(callerId: string, args: UpdateSplitArguments) {
    return await updateSplit(this.pool, callerId, args)
  }

  async setGroupAccess(callerId: string, args: SetGroupAccessArguments) {
    return await setGroupAccess(this.pool, callerId, args)
  }

  async setGroupAdmin(callerId: string, args: SetGroupAdminArguments) {
    return await setGroupAdmin(this.pool, callerId, args)
  }

  async setGroupHidden(callerId: string, args: SetGroupHiddenArguments) {
    return await setGroupHidden(this.pool, callerId, args)
  }

  async getGroupSplits(callerId: string, args: GetGroupSplitsArguments) {
    return await getGroupSplits(this.pool, callerId, args)
  }

  async getUserGroups(callerId: string, args: GetUserGroupsArguments) {
    return await getUserGroups(this.pool, callerId, args)
  }

  async getGroupMembers(callerId: string, args: GetGroupMembersArguments) {
    return await getGroupMembers(this.pool, callerId, args)
  }

  async getUserByEmail(callerId: string, args: GetUserByEmailArguments) {
    return await getUserByEmail(this.pool, callerId, args)
  }

  async getUserById(callerId: string, args: GetUserByIdArguments) {
    return await getUserById(this.pool, callerId, args)
  }

  async getGroupInfo(callerId: string, args: GetGroupInfoArguments) {
    return await getGroupInfo(this.pool, callerId, args)
  }

  async getGroupMembersAutocompletions(
    callerId: string,
    args: GetGroupMembersAutocompletionsArguments
  ) {
    return await getGroupMembersAutocompletions(this.pool, callerId, args)
  }

  async getSplitInfo(callerId: string, args: GetSplitInfoArguments) {
    return await getSplitInfo(this.pool, callerId, args)
  }

  async getBalances(callerId: string, args: GetBalancesArguments) {
    return await getBalances(this.pool, callerId, args)
  }
}
