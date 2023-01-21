import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {configValidationSchema} from './config.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module'
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChannelModule } from './channel/channel.module';
import "reflect-metadata";
import {DataSource} from 'typeorm';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [EventsModule, 
    ScheduleModule.forRoot(), 
    ConfigModule.forRoot({
    envFilePath: [`.env.backend`],
    validationSchema: configValidationSchema,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      return {
        type: 'postgres',
        entities: ["dist/**/*.entity{.ts,.js}"],
        autoLoadEntities: true,
        synchronize: true,
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
      };
    },
  }),
  AuthModule,
  UsersModule,
  ChannelModule,
  GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
