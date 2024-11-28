import { DatabaseService } from './database.service'
import { Injectable } from '@nestjs/common'
import { User } from 'shared'

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createOrUpdateUser(user: User) {
    return this.databaseService.createOrUpdateUser(user)
  }
}
