import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Message} from 'src/entities/message.entity';
import {UsersModule} from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { EventsGateway } from './events.gateway';
import { PongGateway } from './pong.gateaway';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [EventsGateway, ChatGateway, PongGateway],
  exports: [TypeOrmModule],
})
export class EventsModule {}
