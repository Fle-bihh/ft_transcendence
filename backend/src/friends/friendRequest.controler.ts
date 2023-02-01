import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { FriendRequestService } from './friendRequest.service';

@Controller('friend-request')
export class FriendRequestController {
  constructor(private friendRequestService: FriendRequestService) {}

  @Get()
  findAll() {
    return this.friendRequestService.findAll();
  }

}