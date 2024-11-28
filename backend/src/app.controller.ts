import { AppService } from './app.service'
import { AuthGuard } from './auth.guard'
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { CreateGroupArguments, User } from 'shared'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Post('createOrUpdateUser')
  async createOrUpdateUser(@Body() user: User) {
    return await this.appService.createOrUpdateUser(user)
  }

  @UseGuards(AuthGuard)
  @Post('createGroup')
  async createGroup(@Req() request: Request, @Body() args: CreateGroupArguments) {
    return await this.appService.createGroup(request.user.sub, args)
  }
}
