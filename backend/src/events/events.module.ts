import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { Channel } from 'src/entities/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import {Message} from 'src/entities/message.entity';
import { FriendRequestModule } from 'src/friends/friendRequest.module';
import { FriendRequestService } from 'src/friends/friendRequest.service';
import { FriendShipModule } from 'src/friends/friendShip.module';
import { FriendShipService } from 'src/friends/friendShip.service';
import {GameModule} from 'src/game/game.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';
import {UsersModule} from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { EventsGateway } from './events.gateway';
import { PongGateway } from './pong.gateaway';

@Module({
  imports: [
    UsersModule,
    GameModule,
    FriendRequestModule,
    MessagesModule,
    FriendShipModule,
    TypeOrmModule.forFeature(),
    // MessagesService,
  ],
  providers: [EventsGateway, ChatGateway, PongGateway, MessagesService, FriendRequestService, FriendShipService],
  exports: [TypeOrmModule],
})
export class EventsModule {}
