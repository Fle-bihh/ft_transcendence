import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { ApiStrategy } from './42.strategy';
import {JwtStrategy} from './jwt.strategy';
import {UsersController} from 'src/users/users.controller';
import {UsersService} from 'src/users/users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 3600,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [TypeOrmModule, PassportModule, JwtStrategy],
})
export class AuthModule {}

// import { Module } from '@nestjs/common';
// import {TypeOrmModule} from '@nestjs/typeorm';
// import {PassportModule} from '@nestjs/passport';
// // import {JwtModule} from '@nestjs/jwt';
// // import {JwtStrategy} from './jwt.strategy';
// import {ConfigModule, ConfigService} from '@nestjs/config';
// import {User} from 'src/entities/user.entity';
// import {AuthService} from './auth.service';
// import {AuthController} from './auth.controller';

// @Module({
//   imports: [
//     ConfigModule,
//     TypeOrmModule.forFeature([User]),
//     // PassportModule.register({ defaultStrategy: 'jwt' }),
//     // JwtModule.registerAsync({
//     //   imports: [ConfigModule],
//     //   inject: [ConfigService],
//     //   useFactory: async (configService: ConfigService) => ({
//     //     secret: configService.get('JWT_SECRET'),
//     //     signOptions: {
//     //       expiresIn: 3600,
//     //     },
//     //   }),
//     // })
//   ],
//   providers: [AuthService, JwtStrategy],
//   controllers: [AuthController],
//   exports: [TypeOrmModule, JwtStrategy, PassportModule],
// })
// export class AuthModule {}
