import { Message } from "./message.entity";

export declare class Channel {
    id: string;
    name: string;
    password: string;
    messages: Message[];
}
