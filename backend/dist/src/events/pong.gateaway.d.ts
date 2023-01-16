/// <reference types="node" />
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { GameClass } from 'src/pong/gameClass';
export declare class PongGateway {
    private logger;
    private allGames;
    httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    io: Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    getRoomByID(roomID: string): [number, GameClass] | null;
    update_user(client: Socket, user: {
        login: string;
    }): Promise<void>;
    joinRoom(client: Socket, roomId: string): Promise<void>;
    render(client: Socket, roomID: string): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    enter(client: Socket, info: [string, boolean]): Promise<void>;
    arrowUp(client: Socket, info: [string, boolean]): Promise<void>;
    arrowDown(client: Socket, info: [string, boolean]): Promise<void>;
    startGame(client: Socket, info: {
        user: {
            login: string;
        };
        gameMap: string;
    }): Promise<void>;
}
