/// <reference types="node" />
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
export declare class EventsGateway {
    private logger;
    httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    io: Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    connect(): void;
    check_user_exist(client: Socket, userLogin: string): void;
    add_user(client: Socket, data: {
        login: string;
    }): void;
    update_user_socket(client: Socket, data: {
        login: string;
    }): void;
    get_username(client: Socket, login: string): void;
    get_all_users(client: Socket, login: string): void;
    add_friendship(client: Socket, data: {
        login: string;
        login2: string;
    }): void;
    get_user_friends(client: Socket, login: string): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
}
