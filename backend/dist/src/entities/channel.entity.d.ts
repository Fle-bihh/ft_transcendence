import { User } from "src/entities/user.entity";
import { Message } from "./message.entity";
export declare class Channel {
    id: string;
    name: string;
    password: string;
    creator: User | null;
    messages: Message[];
    admin: User[];
    userConnected: User[];
}
