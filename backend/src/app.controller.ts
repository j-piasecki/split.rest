import { AppService } from './app.service'
import { AuthGuard } from './auth.guard'
import { BadRequestException } from './errors/BadRequestException'
import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import {
  AddUserToGroupArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  GetBalancesArguments,
  GetGroupInfoArguments,
  GetGroupJoinLinkArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupMetadataByLinkArguments,
  GetGroupSplitsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  JoinGroupByLinkArguments,
  RestoreSplitArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupNameArguments,
  UpdateSplitArguments,
  User,
  isAddUserToGroupArguments,
  isCreateGroupArguments,
  isCreateGroupJoinLinkArguments,
  isCreateSplitArguments,
  isDeleteGroupArguments,
  isDeleteGroupJoinLinkArguments,
  isDeleteSplitArguments,
  isGetBalancesArguments,
  isGetGroupInfoArguments,
  isGetGroupJoinLinkArguments,
  isGetGroupMembersArguments,
  isGetGroupMembersAutocompletionsArguments,
  isGetGroupMetadataByLinkArguments,
  isGetGroupSplitsArguments,
  isGetSplitHistoryArguments,
  isGetSplitInfoArguments,
  isGetUserByEmailArguments,
  isGetUserByIdArguments,
  isGetUserGroupsArguments,
  isJoinGroupByLinkArguments,
  isRestoreSplitArguments,
  isSetGroupAccessArguments,
  isSetGroupAdminArguments,
  isSetGroupHiddenArguments,
  isSetGroupNameArguments,
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
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.createOrUpdateUser(user)
  }

  @UseGuards(AuthGuard)
  @Post('createGroup')
  async createGroup(@Req() request: Request, @Body() args: Partial<CreateGroupArguments>) {
    if (!isCreateGroupArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.createGroup(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('addUserToGroup')
  async addUserToGroup(@Req() request: Request, @Body() args: Partial<AddUserToGroupArguments>) {
    if (!isAddUserToGroupArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.addUserToGroup(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('createSplit')
  async createSplit(@Req() request: Request, @Body() args: Partial<CreateSplitArguments>) {
    if (!isCreateSplitArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.createSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Delete('deleteSplit')
  async deleteSplit(@Req() request: Request, @Body() args: Partial<DeleteSplitArguments>) {
    if (!isDeleteSplitArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.deleteSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('restoreSplit')
  async restoreSplit(@Req() request: Request, @Body() args: Partial<RestoreSplitArguments>) {
    if (!isRestoreSplitArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.restoreSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('updateSplit')
  async updateSplit(@Req() request: Request, @Body() args: Partial<UpdateSplitArguments>) {
    if (!isUpdateSplitArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.updateSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupAccess')
  async setGroupAccess(@Req() request: Request, @Body() args: Partial<SetGroupAccessArguments>) {
    if (!isSetGroupAccessArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupAccess(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupAdmin')
  async setGroupAdmin(@Req() request: Request, @Body() args: Partial<SetGroupAdminArguments>) {
    if (!isSetGroupAdminArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupAdmin(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupHidden')
  async setGroupHidden(@Req() request: Request, @Body() args: Partial<SetGroupHiddenArguments>) {
    if (!isSetGroupHiddenArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupHidden(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupMembers')
  async getGroupMembers(@Req() request: Request, @Query() args: Partial<GetGroupMembersArguments>) {
    if (!isGetGroupMembersArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupMembers(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserGroups')
  async getUserGroups(@Req() request: Request, @Query() args: Partial<GetUserGroupsArguments>) {
    if (!isGetUserGroupsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getUserGroups(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupSplits')
  async getGroupSplits(@Req() request: Request, @Query() args: Partial<GetGroupSplitsArguments>) {
    if (!isGetGroupSplitsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupSplits(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserByEmail')
  async getUserByEmail(@Req() request: Request, @Query() args: GetUserByEmailArguments) {
    if (!isGetUserByEmailArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getUserByEmail(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserById')
  async getUserById(@Req() request: Request, @Query() args: GetUserByIdArguments) {
    if (!isGetUserByIdArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getUserById(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupInfo')
  async getGroupInfo(@Req() request: Request, @Query() args: GetGroupInfoArguments) {
    if (!isGetGroupInfoArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
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
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupMembersAutocompletions(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getSplitInfo')
  async getSplitInfo(@Req() request: Request, @Query() args: GetSplitInfoArguments) {
    if (!isGetSplitInfoArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getSplitInfo(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getBalances')
  async getBalances(@Req() request: Request, @Query() query: Record<string, string>) {
    const args: GetBalancesArguments = {
      groupId: parseInt(query.groupId),
      users: query.users?.split(','),
      emails: query.emails?.split(','),
    }

    if (!isGetBalancesArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getBalances(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Delete('deleteGroup')
  async deleteGroup(@Req() request: Request, @Body() args: Partial<DeleteGroupArguments>) {
    if (!isDeleteGroupArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.deleteGroup(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupName')
  async setGroupName(@Req() request: Request, @Body() args: Partial<SetGroupNameArguments>) {
    if (!isSetGroupNameArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupName(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('joinGroupByLink')
  async joinGroupByLink(@Req() request: Request, @Body() args: Partial<JoinGroupByLinkArguments>) {
    if (!isJoinGroupByLinkArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.joinGroupByLink(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupMetadataByLink')
  async getGroupMetadataByLink(
    @Req() request: Request,
    @Query() args: GetGroupMetadataByLinkArguments
  ) {
    if (!isGetGroupMetadataByLinkArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupMetadataByLink(args)
  }

  @UseGuards(AuthGuard)
  @Post('createGroupJoinLink')
  async createGroupJoinLink(
    @Req() request: Request,
    @Body() args: Partial<CreateGroupJoinLinkArguments>
  ) {
    if (!isCreateGroupJoinLinkArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.createGroupJoinLink(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Delete('deleteGroupJoinLink')
  async deleteGroupJoinLink(
    @Req() request: Request,
    @Body() args: Partial<DeleteGroupJoinLinkArguments>
  ) {
    if (!isDeleteGroupJoinLinkArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.deleteGroupJoinLink(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupJoinLink')
  async getGroupJoinLink(
    @Req() request: Request,
    @Query() args: Partial<GetGroupJoinLinkArguments>
  ) {
    if (!isGetGroupJoinLinkArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupJoinLink(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getSplitHistory')
  async getSplitHistory(@Req() request: Request, @Query() args: Partial<GetSplitHistoryArguments>) {
    if (!isGetSplitHistoryArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getSplitHistory(request.user.sub, args)
  }
}
