import { addUserToGroup } from './database/addUserToGroup'
import { createDatabase } from './database/createDatabase'
import { createGroup } from './database/createGroup'
import { createOrUpdateUser } from './database/createOrUpdateUser'
import { createSplit } from './database/createSplit'
import { deleteSplit } from './database/deleteSplit'
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
}
