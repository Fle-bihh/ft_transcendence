import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { FriendShip } from 'src/entities/friend-ship.entity';
import { FriendShipController } from './friendShip.controler';
import { FriendShipService } from './friendShip.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([FriendShip]),
  ],
  controllers: [FriendShipController],
  providers: [FriendShipService],
  exports: [TypeOrmModule, FriendShipService],
})
export class FriendShipModule {}
