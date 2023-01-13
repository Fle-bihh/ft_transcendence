export interface IGame {
    GroundWidth: number,
    GroundHeight : number,
    GroundColor: string,
    netWidth : number,
    netColor : string,
    divGame : HTMLElement | null,
    groundLayer : ILayer | null,
    ScoreLayer : ILayer | null,
    playersBallLayer : ILayer | null,
    ScorePosPlayer1 : number,
    ScorePosPlayer2 : number,
    gameOn : boolean,
    startGameButton : any,
    Ball : IBall,
    PlayerOne : IPlayer,
    PlayerTwo : IPlayer,
    Display : IDisplay,
    Keycode : IKeycode,
}

export interface IKeycode {
    KEYDOWN : string,
    KEYUP : string,
    KEYZ : string,
    KEYS : string,
    SPACEBAR : string
}

export interface IPlayer {
    Width : number,
    Height : number,
    Color : string,
    PosX : number,
    PosY : number,
    GoUp : boolean,
    GoDown : boolean,
    Score : number,
    OriginalPosition : string
}

export interface IDisplay {
    Layer : ILayer,
}

export interface ILayer {
	Name : any,
    Canvas : any,
    Context2D : any,
    PosX : number,
    PosY : number,
    Width : any,
    Height : any,
    BackgroundColor : string,
    ZIndex : any,
}

export interface IBall {
    Width : number,
    Height : number,
    Color : string,
    PosX : number,
    PosY : number,
    DirectionX : number,
    DirectionY : number,
    InGame : boolean,
    Speed : number,
}