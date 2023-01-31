import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import {Message} from 'src/entities/message.entity';
import {GameModule} from 'src/game/game.module';
import { MessagesService } from 'src/messages/messages.service';
import {UsersModule} from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { EventsGateway } from './events.gateway';
import { PongGateway } from './pong.gateaway';

@Module({
  imports: [
    UsersModule,
    GameModule,
    TypeOrmModule.forFeature([Message, Channel]),
    // MessagesService,
  ],
  providers: [EventsGateway, ChatGateway, PongGateway, MessagesService, ChannelService],
  exports: [TypeOrmModule],
})
export class EventsModule {}
