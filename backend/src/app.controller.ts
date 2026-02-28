import { FileSizeValidationPipe } from './FileSizeValidationPipe'
import { ImageDimensionsValidationPipe } from './ImageDimensionsValidationPipe'
import { MimeTypeValidationPipe } from './MimeTypeValidationPipe'
import { AppService } from './app.service'
import { AuthGuard } from './auth.guard'
import { BadRequestException } from './errors/BadRequestException'
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Throttle } from '@nestjs/throttler'
import { Request } from 'express'
import {
  AcceptGroupInviteArguments,
  CompleteSplitEntryArguments,
  ConfirmSettleUpArguments,
  CreateGroupArguments,
  CreateGroupJoinLinkArguments,
  CreateOrUpdateUserArguments,
  CreateSplitArguments,
  DeleteGroupArguments,
  DeleteGroupJoinLinkArguments,
  DeleteSplitArguments,
  FileUploadArguments,
  GetBalancesArguments,
  GetDirectGroupInvitesArguments,
  GetGroupInfoArguments,
  GetGroupInviteByLinkArguments,
  GetGroupJoinLinkArguments,
  GetGroupMemberInfoArguments,
  GetGroupMemberPermissionsArguments,
  GetGroupMembersArguments,
  GetGroupMembersAutocompletionsArguments,
  GetGroupMonthlyStatsArguments,
  GetSplitHistoryArguments,
  GetSplitInfoArguments,
  GetSplitParticipantsSuggestionsArguments,
  GetUserByEmailArguments,
  GetUserByIdArguments,
  GetUserGroupsArguments,
  GetUserInvitesArguments,
  InviteUserToGroupArguments,
  JoinGroupByLinkArguments,
  QueryGroupSplitsArguments,
  RegisterOrUpdateNotificationTokenArguments,
  RemoveMemberFromGroupArguments,
  ResolveAllDelayedSplitsAtOnceArguments,
  ResolveDelayedSplitArguments,
  RestoreSplitArguments,
  SetAllowedSplitMethodsArguments,
  SetGroupAccessArguments,
  SetGroupAdminArguments,
  SetGroupHiddenArguments,
  SetGroupIconArguments,
  SetGroupInviteRejectedArguments,
  SetGroupInviteWithdrawnArguments,
  SetGroupLockedArguments,
  SetGroupNameArguments,
  SetUserDisplayNameArguments,
  SetUserNameArguments,
  SettleUpArguments,
  SettleUpGroupArguments,
  UnregisterNotificationTokenArguments,
  UpdateSplitArguments,
  isAcceptGroupInviteArguments,
  isCompleteSplitEntryArguments,
  isConfirmSettleUpArguments,
  isCreateGroupArguments,
  isCreateGroupJoinLinkArguments,
  isCreateOrUpdateUserArguments,
  isCreateSplitArguments,
  isDeleteGroupArguments,
  isDeleteGroupJoinLinkArguments,
  isDeleteSplitArguments,
  isGetBalancesArguments,
  isGetDirectGroupInvitesArguments,
  isGetGroupInfoArguments,
  isGetGroupInviteByLinkArguments,
  isGetGroupJoinLinkArguments,
  isGetGroupMemberInfoArguments,
  isGetGroupMemberPermissionsArguments,
  isGetGroupMembersArguments,
  isGetGroupMembersAutocompletionsArguments,
  isGetGroupMonthlyStatsArguments,
  isGetSplitHistoryArguments,
  isGetSplitInfoArguments,
  isGetSplitParticipantsSuggestionsArguments,
  isGetUserByEmailArguments,
  isGetUserByIdArguments,
  isGetUserGroupsArguments,
  isGetUserInvitesArguments,
  isInviteUserToGroupArguments,
  isJoinGroupByLinkArguments,
  isQueryGroupSplitsArguments,
  isRegisterOrUpdateNotificationTokenArguments,
  isRemoveMemberFromGroupArguments,
  isResolveAllDelayedSplitsAtOnceArguments,
  isResolveDelayedSplitArguments,
  isRestoreSplitArguments,
  isSetAllowedSplitMethodsArguments,
  isSetGroupAccessArguments,
  isSetGroupAdminArguments,
  isSetGroupHiddenArguments,
  isSetGroupIconArguments,
  isSetGroupInviteRejectedArguments,
  isSetGroupInviteWithdrawnArguments,
  isSetGroupLockedArguments,
  isSetGroupNameArguments,
  isSetUserDisplayNameArguments,
  isSetUserNameArguments,
  isSettleUpArguments,
  isSettleUpGroupArguments,
  isUnregisterNotificationTokenArguments,
  isUpdateSplitArguments,
} from 'shared'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard)
  @Post('createOrUpdateUser')
  async createOrUpdateUser(@Body() user: Partial<CreateOrUpdateUserArguments>) {
    if (!isCreateOrUpdateUserArguments(user)) {
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
  @Post('inviteUserToGroup')
  async inviteUserToGroup(
    @Req() request: Request,
    @Body() args: Partial<InviteUserToGroupArguments>
  ) {
    if (!isInviteUserToGroupArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.inviteUser(request.user.sub, args)
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

    if (args.lowToHigh !== undefined) {
      // @ts-expect-error lowToHigh is a string due to being a get query parameter
      args.lowToHigh = args.lowToHigh === 'true'
    }

    return await this.appService.getGroupMembers(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserGroups')
  async getUserGroups(@Req() request: Request, @Query() args: Partial<GetUserGroupsArguments>) {
    if (!isGetUserGroupsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    // @ts-expect-error TODO: remove this once deployed for a while
    if (args.startAfter !== undefined) {
      // @ts-expect-error TODO: remove this once deployed for a while
      args.startAfterId = args.startAfter

      // @ts-expect-error TODO: remove this once deployed for a while
      if (args.startAfter !== '2147483647') {
        args.startAfterUpdate = 0
      }
    }

    return await this.appService.getUserGroups(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('queryGroupSplits')
  async queryGroupSplits(
    @Req() request: Request,
    @Body() args: Partial<QueryGroupSplitsArguments>
  ) {
    if (!isQueryGroupSplitsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.queryGroupSplits(request.user.sub, args)
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
  @Get('getGroupInviteByLink')
  async getGroupInviteByLink(
    @Req() request: Request,
    @Query() args: GetGroupInviteByLinkArguments
  ) {
    if (!isGetGroupInviteByLinkArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupInviteByLink(request.user.sub, args)
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

  @UseGuards(AuthGuard)
  @Get('getGroupMemberPermissions')
  async getGroupMemberPermissions(
    @Req() request: Request,
    @Query() args: Partial<GetGroupMemberPermissionsArguments>
  ) {
    if (!isGetGroupMemberPermissionsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupMemberPermissions(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getUserGroupInvites')
  async getUserGroupInvites(
    @Req() request: Request,
    @Query() args: Partial<GetUserInvitesArguments>
  ) {
    if (!isGetUserInvitesArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getUserGroupInvites(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('acceptGroupInvite')
  async acceptGroupInvite(
    @Req() request: Request,
    @Body() args: Partial<AcceptGroupInviteArguments>
  ) {
    if (!isAcceptGroupInviteArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.acceptGroupInvite(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupInviteRejected')
  async setGroupInviteRejected(
    @Req() request: Request,
    @Body() args: Partial<SetGroupInviteRejectedArguments>
  ) {
    if (!isSetGroupInviteRejectedArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupInviteRejected(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('deleteUser')
  async deleteUser(@Req() request: Request) {
    return await this.appService.deleteUser(request.user.sub)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupMemberInfo')
  async getGroupMemberInfo(
    @Req() request: Request,
    @Query() args: Partial<GetGroupMemberInfoArguments>
  ) {
    if (!isGetGroupMemberInfoArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupMemberInfo(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getDirectGroupInvites')
  async getDirectGroupInvites(
    @Req() request: Request,
    @Query() args: Partial<GetDirectGroupInvitesArguments>
  ) {
    if (!isGetDirectGroupInvitesArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    // @ts-expect-error onlyIfIncluded is a string due to being a get query parameter
    args.onlyIfCreated = args.onlyIfCreated === 'true'

    return await this.appService.getDirectGroupInvites(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupInviteWithdrawn')
  async setGroupInviteWithdrawn(
    @Req() request: Request,
    @Body() args: Partial<SetGroupInviteWithdrawnArguments>
  ) {
    if (!isSetGroupInviteWithdrawnArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupInviteWithdrawn(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setUserName')
  async setUserName(@Req() request: Request, @Body() args: Partial<SetUserNameArguments>) {
    if (!isSetUserNameArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setUserName(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setUserDisplayName')
  async setUserDisplayName(
    @Req() request: Request,
    @Body() args: Partial<SetUserDisplayNameArguments>
  ) {
    if (!isSetUserDisplayNameArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setUserDisplayName(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('registerOrUpdateNotificationToken')
  async registerOrUpdateNotificationToken(
    @Req() request: Request,
    @Body() args: Partial<RegisterOrUpdateNotificationTokenArguments>
  ) {
    if (!isRegisterOrUpdateNotificationTokenArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.registerOrUpdateNotificationToken(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('unregisterNotificationToken')
  async unregisterNotificationToken(
    @Req() request: Request,
    @Body() args: Partial<UnregisterNotificationTokenArguments>
  ) {
    if (!isUnregisterNotificationTokenArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.unregisterNotificationToken(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('completeSplitEntry')
  async completeSplitEntry(
    @Req() request: Request,
    @Body() args: Partial<CompleteSplitEntryArguments>
  ) {
    if (!isCompleteSplitEntryArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.completeSplitEntry(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('uncompleteSplitEntry')
  async uncompleteSplitEntry(
    @Req() request: Request,
    @Body() args: Partial<CompleteSplitEntryArguments>
  ) {
    if (!isCompleteSplitEntryArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.uncompleteSplitEntry(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getSettleUpPreview')
  async getSettleUpPreview(@Req() request: Request, @Query() query: Record<string, string>) {
    const args: SettleUpArguments = {
      groupId: parseInt(query.groupId),
      withMembers: query.withMembers?.split?.(','),
      amounts: query.amounts?.split?.(','),
    }

    // TODO: add support for full subgroup settle up (only one on one settle up for now)
    if (!isSettleUpArguments(args) || (args.withMembers?.length ?? 0) > 1) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getSettleUpPreview(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('confirmSettleUp')
  async confirmSettleUp(@Req() request: Request, @Body() args: Partial<ConfirmSettleUpArguments>) {
    // TODO: add support for full subgroup settle up (only one on one settle up for now)
    if (!isConfirmSettleUpArguments(args) || (args.withMembers?.length ?? 0) > 1) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.confirmSettleUp(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getSplitParticipantsSuggestions')
  async getSplitParticipantsSuggestions(
    @Req() request: Request,
    @Query() query: Record<string, string>
  ) {
    const args: GetSplitParticipantsSuggestionsArguments = {
      groupId: parseInt(query.groupId),
    }

    if (!isGetSplitParticipantsSuggestionsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getSplitParticipantsSuggestions(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupLocked')
  async setGroupLocked(@Req() request: Request, @Body() args: Partial<SetGroupLockedArguments>) {
    if (!isSetGroupLockedArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupLocked(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('settleUpGroup')
  async settleUpGroup(@Req() request: Request, @Body() args: Partial<SettleUpGroupArguments>) {
    if (!isSettleUpGroupArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.settleUpGroup(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('resolveDelayedSplit')
  async resolveDelayedSplit(
    @Req() request: Request,
    @Body() args: Partial<ResolveDelayedSplitArguments>
  ) {
    if (!isResolveDelayedSplitArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.resolveDelayedSplit(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('resolveAllDelayedSplitsAtOnce')
  async resolveAllDelayedSplitsAtOnce(
    @Req() request: Request,
    @Body() args: Partial<ResolveAllDelayedSplitsAtOnceArguments>
  ) {
    if (!isResolveAllDelayedSplitsAtOnceArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.resolveAllDelayedSplitsAtOnce(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('setGroupAllowedSplitMethods')
  async setGroupAllowedSplitMethods(
    @Req() request: Request,
    @Body() args: Partial<SetAllowedSplitMethodsArguments>
  ) {
    if (!isSetAllowedSplitMethodsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupAllowedSplitMethods(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Get('getGroupMonthlyStats')
  async getGroupMonthlyStats(
    @Req() request: Request,
    @Query() args: Partial<GetGroupMonthlyStatsArguments>
  ) {
    if (!isGetGroupMonthlyStatsArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.getGroupMonthlyStats(request.user.sub, args)
  }

  @UseGuards(AuthGuard)
  @Post('removeMember')
  async removeMember(
    @Req() request: Request,
    @Body() args: Partial<RemoveMemberFromGroupArguments>
  ) {
    if (!isRemoveMemberFromGroupArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.removeMember(request.user.sub, args)
  }

  @Throttle({ default: { limit: 10, ttl: 1000 * 60 * 60 * 24 } })
  @UseGuards(AuthGuard)
  @Post('setProfilePicture')
  @UseInterceptors(FileInterceptor('file'))
  async setProfilePicture(
    @Req() request: Request,
    @Body() args: FileUploadArguments,
    @UploadedFile(
      new FileSizeValidationPipe(20), // 20KB
      new MimeTypeValidationPipe(['image/png', 'image/jpeg', 'image/jpg']),
      new ImageDimensionsValidationPipe({
        minWidth: 128,
        aspectRatio: 1,
      })
    )
    file?: Express.Multer.File
  ) {
    return await this.appService.setProfilePicture(request.user.sub, args, file)
  }

  @Throttle({ default: { limit: 10, ttl: 1000 * 60 * 60 * 24 } })
  @UseGuards(AuthGuard)
  @Post('setGroupIcon')
  @UseInterceptors(FileInterceptor('file'))
  async setGroupIcon(
    @Req() request: Request,
    @Body() args: SetGroupIconArguments,
    @UploadedFile(
      new FileSizeValidationPipe(20), // 20KB
      new MimeTypeValidationPipe(['image/png', 'image/jpeg', 'image/jpg']),
      new ImageDimensionsValidationPipe({
        minWidth: 128,
        aspectRatio: 1,
      })
    )
    file?: Express.Multer.File
  ) {
    if (!isSetGroupIconArguments(args)) {
      throw new BadRequestException('api.invalidArguments')
    }

    return await this.appService.setGroupIcon(request.user.sub, args, file)
  }
}
