import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { FriendRequest } from 'src/entities/friend-request.entity';
import { FriendRequestController } from './friendRequest.controler';
import { FriendRequestService } from './friendRequest.service';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([FriendRequest]),
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  exports: [TypeOrmModule, FriendRequestService],
})
export class FriendRequestModule {}
