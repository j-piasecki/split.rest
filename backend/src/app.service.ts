import { DatabaseService } from './database.service'
import { Injectable } from '@nestjs/common'
import { CreateGroupArguments, User } from 'shared'

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createOrUpdateUser(user: User) {
    return this.databaseService.createOrUpdateUser(user)
  }

  async createGroup(userId: string, args: CreateGroupArguments) {
    return this.databaseService.createGroup(userId, args)
  }
}
