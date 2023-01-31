import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { MessagesController } from 'src/messages/messages.controler';
import { MessagesService } from 'src/messages/messages.service';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Channel, Message]),
  ],
  controllers: [ChannelController, MessagesController],
  providers: [ChannelService, MessagesService],
  exports: [TypeOrmModule, ChannelService],
})
export class ChannelModule {}
