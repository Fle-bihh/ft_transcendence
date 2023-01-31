import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';

export class MessagesDto {
  // sentAt: string;
  // sender: User;
  // receiver: User | null;
  // body: string;
  // channel: Channel | null;
  sender: string;
  receiver: string;
  content: string;
  date: Date;
}

export class ChannelsDto {
  // sentAt: string;
  // sender: User;
  // receiver: User | null;
  // body: string;
  // channel: Channel | null;
  name: string;
  privacy: string;
  description: string;
  password: string;
  owner: string;
}
