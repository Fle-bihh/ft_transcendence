import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { EventsGateway } from './events.gateway';
import { PongGateway } from './pong.gateaway';

@Module({
  providers: [EventsGateway, ChatGateway, PongGateway],
})
export class EventsModule {}