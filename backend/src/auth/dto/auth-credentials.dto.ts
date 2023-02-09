import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Channel } from 'src/entities/channel.entity';
import { Game } from 'src/entities/game.entity';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  login: string;

  @IsString()
  profileImage?: string | null;

  @IsString()
  email: string;

  admin: boolean = false;

  games: Game[];

  messagesSent: Message[];

  messagesReceived: Message[];

  channels: Channel[];

  channelsAdmin: Channel[];

  channelsConnected: Channel[];

  blockList: User[];

  accessToken: string | null;
}
