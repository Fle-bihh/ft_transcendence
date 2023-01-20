import { Channel } from "./channel.entity";
export declare class Message {
    id: string;
    content: string;
    date: string;
    channel: Channel | null;
}
