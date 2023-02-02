import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { MessagesService } from '../messages/messages.service';

@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) { }

  // @Get('channelMessages/:name')
  // getChannelMessages(@Param() data: { name: string }) {
  //   return this.channelService.getChannelMessages(data.name)
  // }
  //
  // @Get()
  // getAllChannels() {
  //   return this.channelService.getAllChannels();
  // }
  //
  // @Get('channel/:name')
  // findChannel(@Param() data: { name: string }) {
  //   console.log(data.name)
  //   return this.channelService.findChannel(data.name);
  // }

}
