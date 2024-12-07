import { createDatabase } from './database/createDatabase'
import { addUserToGroup } from './database/groups/addUserToGroup'
import { createGroup } from './database/groups/createGroup'
import { deleteGroup } from './database/groups/deleteGroup'
import { getBalances } from './database/groups/getBalances'
import { getGroupInfo } from './database/groups/getGroupInfo'
import { getGroupMembers } from './database/groups/getGroupMembers'
import { getGroupMembersAutocompletions } from './database/groups/getGroupMembersAutocompletions'
import { getGroupSplits } from './database/groups/getGroupSplits'
import { getUserGroups } from './database/groups/getUserGroups'
import { setGroupAccess } from './database/groups/setGroupAccess'
import { setGroupAdmin } from './database/groups/setGroupAdmin'
import { setGroupHidden } from './database/groups/setGroupHidden'
import { setGroupName } from './database/groups/setGroupName'
import { createSplit } from './database/splits/createSplit'
import { deleteSplit } from './database/splits/deleteSplit'
import { getSplitInfo } from './database/splits/getSplitInfo'
import { restoreSplit } from './database/splits/restoreSplit'
import { updateSplit } from './database/splits/updateSplit'
import { createOrUpdateUser } from './database/users/createOrUpdateUser'
import { getUserByEmail } from './database/users/getUserByEmail'
import { getUserById } from './database/users/getUserById'
import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
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
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupNameArguments,
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

  async deleteGroup(callerId: string, args: DeleteGroupArguments) {
    return await deleteGroup(this.pool, callerId, args)
  }

  async setGroupName(callerId: string, args: SetGroupNameArguments) {
    return await setGroupName(this.pool, callerId, args)
  }
}
