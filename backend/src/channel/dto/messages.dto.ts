import { Channel } from 'src/entities/channel.entity';
import { User } from 'src/entities/user.entity';

export class MessagesDto {
  body: string;
  date: Date;
  sender: User;
  receiver: User | null;
  channel: Channel | null;
}
