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
    checkCollisionPlayer(id: number): boolean;
    movePlayer(): void;
    moveBall(): void;
    reset(): void;
    moveAll(): void;
}
export declare class Player {
    id: string;
    username: string;
    width: number;
    height: number;
    goUp: boolean;
    goDown: boolean;
    posX: number;
    posY: number;
    score: number;
    ready: boolean;
    speed: number;
    reco: number;
    inGame: boolean;
    constructor(canvas: Canvas, username?: string, id?: string);
    reset(canvas: Canvas): void;
}
export declare class Map {
    mapColor: string;
    constructor(gameMap: string);
}
export declare class Ball {
    posX: number;
    posY: number;
    directionX: number;
    directionY: number;
    speed: number;
    radius: number;
    old_x: number;
    old_y: number;
    constructor(canvas: Canvas);
    reset(canvas: Canvas): void;
}
