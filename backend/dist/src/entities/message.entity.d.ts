import { Channel } from "./channel.entity";
import { User } from "./user.entity";
export declare class Message {
    id: string;
    content: string;
    date: string;
    sender: User;
    receiver: User | null;
    channel: Channel | null;
}
