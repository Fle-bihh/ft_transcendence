/// <reference types="node" />
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
export declare class ChatGateway {
    private logger;
    httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    io: Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    connect(): void;
    add_message(client: Socket, data: {
        sender: string;
        receiver: string;
        content: string;
    }): void;
    create_channel(client: Socket, data: {
        privacy: string;
        name: string;
        password: string;
        description: string;
        owner: string;
    }): void;
    get_all_channels(client: Socket, login: string): void;
    join_channel(client: Socket, data: {
        login: string;
        channelName: string;
        channelPassword: string;
    }): void;
    leave_channel(client: Socket, data: {
        login: string;
        channelName: string;
    }): void;
    add_participant(client: Socket, data: {
        login: string;
        channel: string;
        admin: boolean;
    }): void;
    get_participants(client: Socket, data: {
        login: string;
        channel: string;
    }): void;
    get_participant_role(client: Socket, data: {
        login: string;
        channel: string;
    }): void;
    change_channel_name(client: Socket, data: {
        login: string;
        currentName: string;
        newName: string;
    }): void;
    change_channel_password(client: Socket, data: {
        login: string;
        channelName: string;
        newPassword: string;
    }): void;
    get_channel(client: Socket, data: {
        sender: string;
        receiver: string;
    }): void;
    get_conv(client: Socket, data: {
        sender: string;
        receiver: string;
    }): void;
    get_all_conv_info(client: Socket, data: {
        sender: string;
    }): void;
    add_user(client: Socket, data: {
        login: string;
    }): void;
    block_user(client: Socket, data: {
        login: string;
        target: string;
    }): void;
    update_user_socket(client: Socket, data: {
        login: string;
    }): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
}
