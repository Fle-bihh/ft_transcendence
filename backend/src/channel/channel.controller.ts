import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { MessagesService } from '../messages/messages.service';

@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) { }

}
