import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [TypeOrmModule],
})
export class ChannelModule {}
