import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';
import { MessagesController } from './messages.controler';
import { MessagesService } from './messages.service';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [TypeOrmModule, MessagesService],
})
export class MessagesModule {}
