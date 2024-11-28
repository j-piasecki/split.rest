import { DatabaseService } from './database.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHello(): string {
    return this.databaseService.test()
  }
}
