import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get('convers/:login1/:login2')
  findConvers(@Param() data :{login1: string, login2: string}) {
    return this.messagesService.findConvers(data.login1, data.login2);
  }
}