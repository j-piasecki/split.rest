import { AppService } from './app.service'
import { AuthGuard } from './auth.guard'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { User } from 'shared'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrUpdateUser(@Body() user: User) {
    return await this.appService.createOrUpdateUser(user)
  }
}
