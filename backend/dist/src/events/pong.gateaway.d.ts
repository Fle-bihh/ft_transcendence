import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { GameClass } from 'src/pong/gameClass';
export declare class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger;
    private allGames;
    io: Server;
    getRoomByID(roomID: string): [number, GameClass] | null;
    getRoomByClientLogin(ClientLogin: string): [number, GameClass] | null;
    getAllRoomByClientID(ClientID: string): any[];
    joinRoom(client: Socket, roomId: string): Promise<void>;
    render(roomID: string): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    checkReconnexion(client: Socket, user: {
        login: string;
    }): Promise<void>;
    clientStatusGame(): void;
    handleInterval(): Promise<void>;
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
