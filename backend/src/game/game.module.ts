import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Game} from 'src/entities/game.entity';
import {AuthModule} from 'src/auth/auth.module';
import {UsersModule} from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    AuthModule,
    UsersModule,
  ],
  providers: [GameService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
