import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Channel } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';
import { MessagesController } from 'src/messages/messages.controler';
import { MessagesService } from 'src/messages/messages.service';
import { UsersModule } from 'src/users/users.module';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([Channel, Message]),
  ],
  controllers: [ChannelController, MessagesController],
  providers: [ChannelService, MessagesService],
  exports: [TypeOrmModule, ChannelService],
})
export class ChannelModule {}
