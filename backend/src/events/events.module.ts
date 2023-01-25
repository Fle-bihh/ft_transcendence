import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Message} from 'src/entities/message.entity';
import {GameModule} from 'src/game/game.module';
import {UsersModule} from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { EventsGateway } from './events.gateway';
import { PongGateway } from './pong.gateaway';

@Module({
  imports: [
    UsersModule,
    GameModule,
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [EventsGateway, ChatGateway, PongGateway],
  exports: [TypeOrmModule],
})
export class EventsModule {}
