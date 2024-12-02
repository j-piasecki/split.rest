import { AppService } from './app.service'
import { AuthGuard } from './auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import {
  AddUserToGroupArguments,
  CreateGroupArguments,
  CreateSplitArguments,
  DeleteSplitArguments,
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
  isAddUserToGroupArguments,
  isCreateGroupArguments,
  isCreateSplitArguments,
  isDeleteSplitArguments,
  isGetGroupInfoArguments,
  isGetGroupMembersArguments,
  isGetGroupMembersAutocompletionsArguments,
  isGetGroupSplitsArguments,
  isGetSplitInfoArguments,
  isGetUserByEmailArguments,
  isGetUserByIdArguments,
  isGetUserGroupsArguments,
  isRestoreSplitArguments,
  isSetGroupAccessArguments,
  isSetGroupAdminArguments,
  isSetGroupHiddenArguments,
  isUpdateSplitArguments,
  isUser,
} from 'shared'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Post('createOrUpdateUser')
  async createOrUpdateUser(@Body() user: Partial<User>) {
    if (!isUser(user)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.createOrUpdateUser(user)
  }

  @UseGuards(AuthGuard)
  @Post('createGroup')
  async createGroup(@Req() request: Request, @Body() args: Partial<CreateGroupArguments>) {
    if (!isCreateGroupArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.createGroup(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('addUserToGroup')
  async addUserToGroup(@Req() request: Request, @Body() args: Partial<AddUserToGroupArguments>) {
    if (!isAddUserToGroupArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.addUserToGroup(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('createSplit')
  async createSplit(@Req() request: Request, @Body() args: Partial<CreateSplitArguments>) {
    if (!isCreateSplitArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.createSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('deleteSplit')
  async deleteSplit(@Req() request: Request, @Body() args: Partial<DeleteSplitArguments>) {
    if (!isDeleteSplitArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.deleteSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('restoreSplit')
  async restoreSplit(@Req() request: Request, @Body() args: Partial<RestoreSplitArguments>) {
    if (!isRestoreSplitArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.restoreSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('updateSplit')
  async updateSplit(@Req() request: Request, @Body() args: Partial<UpdateSplitArguments>) {
    if (!isUpdateSplitArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.updateSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupAccess')
  async setGroupAccess(@Req() request: Request, @Body() args: Partial<SetGroupAccessArguments>) {
    if (!isSetGroupAccessArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.setGroupAccess(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupAdmin')
  async setGroupAdmin(@Req() request: Request, @Body() args: Partial<SetGroupAdminArguments>) {
    if (!isSetGroupAdminArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.setGroupAdmin(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupHidden')
  async setGroupHidden(@Req() request: Request, @Body() args: Partial<SetGroupHiddenArguments>) {
    if (!isSetGroupHiddenArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.setGroupHidden(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupMembers')
  async getGroupMembers(@Req() request: Request, @Query() args: Partial<GetGroupMembersArguments>) {
    if (!isGetGroupMembersArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getGroupMembers(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserGroups')
  async getUserGroups(@Req() request: Request, @Query() args: Partial<GetUserGroupsArguments>) {
    if (!isGetUserGroupsArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getUserGroups(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupSplits')
  async getGroupSplits(@Req() request: Request, @Query() args: Partial<GetGroupSplitsArguments>) {
    if (!isGetGroupSplitsArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getGroupSplits(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserByEmail')
  async getUserByEmail(@Req() request: Request, @Query() args: GetUserByEmailArguments) {
    if (!isGetUserByEmailArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getUserByEmail(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserById')
  async getUserById(@Req() request: Request, @Query() args: GetUserByIdArguments) {
    if (!isGetUserByIdArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getUserById(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupInfo')
  async getGroupInfo(@Req() request: Request, @Query() args: GetGroupInfoArguments) {
    if (!isGetGroupInfoArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getGroupInfo(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupMemberAutocompletions')
  async getGroupMemberAutocompletions(
    @Req() request: Request,
    @Query() args: GetGroupMembersAutocompletionsArguments
  ) {
    if (!isGetGroupMembersAutocompletionsArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getGroupMembersAutocompletions(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getSplitInfo')
  async getSplitInfo(@Req() request: Request, @Query() args: GetSplitInfoArguments) {
    if (!isGetSplitInfoArguments(args)) {
      throw new BadRequestException('Invalid arguments')
    }

    return await this.appService.getSplitInfo(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getProfilePicture')
  async profilePicture(@Req() request: Request, @Query() args: { photoURL: string }) {
    const photo = await this.appService.getProfilePicture(args.photoURL)
    return {
      photo: photo,
    }
  }
}
