export declare class Canvas {
    width: number;
    height: number;
    constructor();
}
export declare class GameClass {
    groundWidth: number;
    groundHeight: number;
    groundColor: string;
    netWidth: number;
    netColor: string;
    scorePosPlayer1: number;
    scorePosPlayer2: number;
    gameOn: boolean;
    startGameButton: any;
    map: Map;
    roomID: string;
    canvas: Canvas;
    ball: Ball;
    players: Array<Player>;
    KEYDOWN: string;
    KEYUP: string;
    KEYZ: string;
    KEYS: string;
    SPACEBAR: string;
    constructor(gameMap: string, username: string, roomID: string, playerId: string);
    setOponnent(id: string, username: string): void;
}
export declare class Player {
    username: string;
    id: string;
    width: number;
    height: number;
    color: string;
    posX: number;
    posY: number;
    goUp: boolean;
    goDown: boolean;
    score: number;
    originalPosition: string;
    ready: boolean;
    constructor(position: string, username?: string, id?: string);
}
export declare class Map {
    mapColor: string;
    constructor(gameMap: string);
}
export declare class Ball {
    width: number;
    height: number;
    color: string;
    posX: number;
    posY: number;
    directionX: number;
    directionY: number;
    inGame: boolean;
    speed: number;
    radius: number;
    constructor(canvas: Canvas);
}
