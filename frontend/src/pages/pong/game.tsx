import { IGame, IPlayer, ILayer, IBall } from "./game.interface";
import { useEffect } from 'react';

const Game = () => {
  let requestAnimId : any;
  var game = {
    GroundWidth : 700,
    GroundHeight : 400,
    GroundColor: "#000000",
    netWidth : 6,
    netColor : "#FFFFFF",
    divGame : null,
    groundLayer : null,
    ScoreLayer : null,
    playersBallLayer : null,
    ScorePosPlayer1 : 300,
    ScorePosPlayer2 : 365,
    gameOn : false,
    startGameButton : null,
    Ball : {
      Width : 10,
      Height : 10,
      Color : "#FFFFFF",
      PosX : 200,
      PosY : 200,
      DirectionX : 1,
      DirectionY : 1,
      InGame : false,
      Speed : 1
    },
    PlayerOne : {
      Width : 10,
      Height : 50,
      Color : "#FFFFFF",
      PosX : 30,
      PosY : 200,
      GoUp : false,
      GoDown : false,
      Score : 0,
      OriginalPosition : "left"
    },   
    PlayerTwo : {
      Width : 10,
      Height : 50,
      Color : "#FFFFFF",
      PosX : 650,
      PosY : 200,
      GoUp : false,
      GoDown : false,
      Score : 0,
      OriginalPosition : "right"
    },
    Display : {
      Layer : {
          Name : "",
          Canvas : "",
          Context2D : "",
          PosX : 0,
          PosY : 0,
          Width : "",
          Height : "",
          BackgroundColor : "",
          ZIndex : "",
      },
    },
    Keycode : {
      KEYDOWN : "ArrowDown",
      KEYUP : "ArrowUp",
      KEYZ : "z",
      KEYS : "s",
      SPACEBAR : " ",
    }
  };
 
  function BallMove(Ball : IBall) {
  if (Ball?.InGame) {
    Ball.PosX += Ball.DirectionX * Ball.Speed;
    Ball.PosY += Ball.DirectionY * Ball.Speed;
    }
  };

  function BallBounce() {
    if (game?.Ball.PosX > game?.GroundWidth || game?.Ball.PosX < 0)
      game.Ball.DirectionX = -game?.Ball.DirectionX;
    if (game?.Ball.PosY > game?.GroundHeight || game?.Ball.PosY < 0)
      game.Ball.DirectionY = -game?.Ball.DirectionY;         
  };

  function BallCollide( anotherItem : ILayer | IPlayer) {
    if ( !( game?.Ball.PosX >= anotherItem.PosX + anotherItem.Width || game?.Ball.PosX <= anotherItem.PosX - game?.Ball.Width
    || game?.Ball.PosY >= anotherItem.PosY + anotherItem.Height || game?.Ball.PosY <= anotherItem.PosY - game?.Ball.Height ) )
      return true;
    return false;
  };

  function BallLost(Ball : IBall, player : IPlayer) {
    var returnValue = false;
    if ( player.OriginalPosition === "left" && Ball.PosX < player.PosX - Ball.Width ) {
      returnValue = true;
    } else if ( player.OriginalPosition === "right" && Ball.PosX > player.PosX + player.Width ) {
      returnValue = true;
    }
    return (returnValue);
  };

  function BallSpeedUp(Ball : IBall) {
    Ball.Speed = Ball?.Speed + .1;
  };
   
  function GameInit(game : IGame) {
    console.log("INIT Game");
    let div = document.getElementById("divGame");
    if (div)
    {
      game.divGame = div;
      game.groundLayer= CreateLayer("terrain", game?.GroundWidth, game?.GroundHeight, game?.divGame, 0, "#000000", 10, 50); 
      // if (game?.groundLayer)
      //   DrawRectangleInLayer(game?.groundLayer, game?.netWidth, game?.GroundHeight, game?.netColor, game?.GroundWidth/2 - game?.netWidth/2, 0);
      game.ScoreLayer = CreateLayer("Score", game?.GroundWidth, game?.GroundHeight, game?.divGame, 1, undefined, 10, 50);
      // if (game?.ScoreLayer)
      //   DrawTextInLayer(game?.ScoreLayer , "SCORE", "10px Arial", "#FF0000", 10, 10);  
      game.playersBallLayer = CreateLayer("joueursetBalle", game?.GroundWidth, game?.GroundHeight, game?.divGame, 2, undefined, 10, 50);  
      // if (game?.playersBallLayer)
      //   DrawTextInLayer(game?.playersBallLayer, "JOUEURSETBALLE", "10px Arial", "#FF0000", 100, 100);
    }
    DisplayScore(0,0);
    DisplayBall();
    DisplayPlayers();
    SpeedUpBall();
    return (game);
  };

  function MoveBall() { 
    BallMove(game?.Ball);
    BallBounce();
    DisplayBall();
  };

  function DisplayScore( ScorePlayer1 : number, ScorePlayer2 : number) {
    if (game?.ScoreLayer)
      DrawTextInLayer(game?.ScoreLayer, ScorePlayer1.toString(), "60px Arial", "#FFFFFF", game?.ScorePosPlayer1, 55);
    if (game?.ScoreLayer)
      DrawTextInLayer(game?.ScoreLayer, ScorePlayer2.toString(), "60px Arial", "#FFFFFF", game?.ScorePosPlayer2, 55);
  };

  function DisplayBall() {
    if (game?.playersBallLayer)
      DrawRectangleInLayer(game?.playersBallLayer, game?.Ball.Width, game?.Ball.Height, game?.Ball.Color, game?.Ball.PosX, game?.Ball.PosY);
  };

  function DisplayPlayers() {
    if (game?.playersBallLayer)
      DrawRectangleInLayer(game?.playersBallLayer, game?.PlayerOne.Width, game?.PlayerOne.Height, game?.PlayerOne.Color, game?.PlayerOne.PosX, game?.PlayerOne.PosY);
    if (game?.playersBallLayer)
      DrawRectangleInLayer(game?.playersBallLayer, game?.PlayerTwo.Width, game?.PlayerTwo.Height, game?.PlayerTwo.Color, game?.PlayerTwo.PosX, game?.PlayerTwo.PosY);
  };

  function ClearLayer(targetLayer : ILayer | null) {
    if (targetLayer)
      targetLayer.Context2D.clearRect(0, 0, targetLayer.Width, targetLayer.Height);
  };

  function MovePlayers() {
    if (game?.PlayerOne.GoUp && game?.PlayerOne.PosY > 0)
      game.PlayerOne.PosY-=5;
    else if (game?.PlayerOne.GoDown && game?.PlayerOne.PosY < game?.GroundHeight - game?.PlayerOne.Height)
      game.PlayerOne.PosY+=5;
    if (game?.PlayerTwo.GoUp && game?.PlayerTwo.PosY > 0)
      game.PlayerTwo.PosY-=5;
    else if (game?.PlayerTwo.GoDown && game?.PlayerTwo.PosY < game?.GroundHeight - game?.PlayerTwo.Height)
      game.PlayerTwo.PosY+=5;
    };

  function CollideBallWithPlayersAndAction() { 
    if (BallCollide(game?.PlayerOne) )
      ChangeBallPath(game?.PlayerOne, game?.Ball);
    if (BallCollide(game?.PlayerTwo) )
      ChangeBallPath(game?.PlayerTwo, game?.Ball);
  };

  function LostBall() {
    if (BallLost(game?.Ball, game?.PlayerOne) ) {
        game.PlayerTwo.Score++;
      if ( game?.PlayerTwo.Score > 9 ) {
        game.gameOn = false;
      } else {
        game.Ball.InGame = false;
      }
    } else if (BallLost(game?.Ball, game?.PlayerTwo) ) {
      game.PlayerOne.Score++;
      if ( game?.PlayerOne.Score > 9 ) {
        game.gameOn = false;
      } else {
        game.Ball.InGame = false;
      }
    }
    ClearLayer(game?.ScoreLayer);
    DisplayScore(game?.PlayerOne.Score, game?.PlayerTwo.Score);
  };

  function ReinitGame() {
    game.Ball.InGame = false;
    game.Ball.Speed = 1;
    game.PlayerOne.Score = 0;
    game.PlayerTwo.Score = 0;
    ClearLayer(game?.ScoreLayer);
    DisplayScore(game?.PlayerOne.Score, game?.PlayerTwo.Score);
  };

  function BallOnPlayer(player : IPlayer, Ball : IBall) {
    var returnValue = "CENTER";
    var playerPositions = player.Height/5;
    if ( Ball.PosY > player.PosY && Ball.PosY < player.PosY + playerPositions ) {
      returnValue = "TOP";
    } else if ( Ball.PosY >= player.PosY + playerPositions && Ball.PosY < player.PosY + playerPositions*2 ) {
      returnValue = "MIDDLETOP";
    } else if ( Ball.PosY >= player.PosY + playerPositions*2 && Ball.PosY < player.PosY + player.Height - playerPositions ) {
      returnValue = "MIDDLEBOTTOM";
    } else if ( Ball.PosY >= player.PosY + player.Height - playerPositions && Ball.PosY < player.PosY + player.Height ) {
      returnValue = "BOTTOM";
    }
    return returnValue;
  };

  function ChangeBallPath(player : IPlayer, Ball : IBall) {
    if (player.OriginalPosition === "left") {
      switch(BallOnPlayer(player, Ball)) {
        case "TOP":
          Ball.DirectionX = 1;
          Ball.DirectionY = -3;
          break;
        case "MIDDLETOP":
          Ball.DirectionX = 1;
          Ball.DirectionY = -1;
          break;
        case "CENTER":
          Ball.DirectionX = 2;
          Ball.DirectionY = 0;
          break;
        case "MIDDLEBOTTOM":
          Ball.DirectionX = 1;
          Ball.DirectionY = 1;
          break;
        case "BOTTOM":
          Ball.DirectionX = 1;
          Ball.DirectionY = 3;
          break;
      }
    } else {
      switch(BallOnPlayer(player, Ball)) {
        case "TOP":
          Ball.DirectionX = -1;
          Ball.DirectionY = -3;
          break;
        case "MIDDLETOP":
          Ball.DirectionX = -1;
          Ball.DirectionY = -1;
          break;
        case "CENTER":
          Ball.DirectionX = -2;
          Ball.DirectionY = 0;
          break;
        case "MIDDLEBOTTOM":
          Ball.DirectionX = -1;
          Ball.DirectionY = 1;
          break;
        case "BOTTOM":
          Ball.DirectionX = -1;
          Ball.DirectionY = 3;
          break;
      }
    }
};

  function SpeedUpBall() { 
    setInterval(function() {
      BallSpeedUp(game?.Ball);
    }, 3000);
  };

  function CreateLayer( name : string, Width : number, Height : number, htmlContainer : HTMLElement | undefined, zIndex : number, backgroundColor : string | undefined, x : number | undefined, y : number | undefined) {
    if (game)
    {
      var layer = Object.create(game.Display.Layer);
      layer.Canvas = window.document.createElement("Canvas");
      layer.Canvas.id = name;
      layer.Name = name;
      if ( backgroundColor !== undefined )
        layer.Canvas.style.background = backgroundColor;
      layer.ZIndex = zIndex;
      layer.Canvas.style.zIndex = zIndex;
      layer.Width = Width;
      layer.Canvas.width = Width;
      layer.Height = Height;
      layer.Canvas.height = Height;
      if ( x !== undefined )
        layer.PosX = x;
      if ( y !== undefined )
        layer.PosY = y;
      layer.Canvas.style.position = "absolute";
      if ( x !== undefined )
        layer.Canvas.style.left = x;
      if ( y !== undefined )
        layer.Canvas.style.top = y;
      if ( htmlContainer !== undefined ) {
        htmlContainer.appendChild(layer.Canvas);
      } else {
        document.body.appendChild(layer.Canvas);
      }
      layer.Context2D = layer.Canvas.getContext('2d');
    }
    return (layer);
  };

  function DrawRectangleInLayer(targetLayer : ILayer, Width : number, heigth : number, Color : string, x : number, y : number) {
    targetLayer.Context2D.fillStyle = Color;
    targetLayer.Context2D.fillRect(x, y, Width, heigth);
  };

  function DrawTextInLayer(targetLayer : ILayer | null, text : string, font : string, Color : string, x : number, y : number) {
    if (targetLayer)
    {
      targetLayer.Context2D.font = font;
      targetLayer.Context2D.fillStyle = Color;
      targetLayer.Context2D.fillText(text, x, y);
    }
  };

  function OnKeyDown( event : any) {
    if (game?.PlayerOne && game?.PlayerTwo)
    {
      if ( event?.key === game?.Keycode.KEYDOWN ) {
        game.PlayerTwo.GoDown = true;
      } else if ( event?.key === game?.Keycode.KEYUP ) {
        game.PlayerTwo.GoUp = true;
      } else if ( event?.key === game?.Keycode.KEYS ) {
        game.PlayerOne.GoDown = true;
      } else if ( event?.key === game?.Keycode.KEYZ ) {
        game.PlayerOne.GoUp = true;
      }
      if ( event?.key === game?.Keycode.SPACEBAR && !game?.Ball.InGame && game?.gameOn) { 
        let rand = Math.random() * 2;
        game.Ball.InGame = true;
        game.Ball.PosX = game?.GroundWidth / 2;
        game.Ball.PosY = game?.GroundHeight / 2;
        if (rand === 0)
        {
            game.Ball.DirectionX = 1;
            game.Ball.DirectionY = 1;
        } else {
            game.Ball.DirectionX = -1;
            game.Ball.DirectionY = 1;
        }
      }
    }
  };

  function OnKeyUp( event : any) {
    if (game?.PlayerOne && game?.PlayerTwo)
    {
      if ( event?.key === game?.Keycode.KEYDOWN ) {
        game.PlayerTwo.GoDown = false;
      } else if ( event?.key === game?.Keycode.KEYUP ) {
        game.PlayerTwo.GoUp = false;
      } else if ( event?.key === game?.Keycode.KEYS ) {
        game.PlayerOne.GoDown = false;
      } else if ( event?.key === game?.Keycode.KEYZ ) {
        game.PlayerOne.GoUp = false;
      }
    }
  };
    
  function OnStartGameClickButton() {
    if ( !game?.gameOn ) {
      ReinitGame();
      game.gameOn = true;
    }
  };

  let initialisation = function() {
    if (!game.groundLayer)
      GameInit(game);
    requestAnimId = window.requestAnimationFrame(main);
  }
  
  const main = function() {
    ClearLayer(game.playersBallLayer);
    MovePlayers();
    DisplayPlayers();
    MoveBall();
    if ( game.Ball.InGame ) {
      LostBall();
    }
    CollideBallWithPlayersAndAction();
    requestAnimId = window.requestAnimationFrame(main);
  }

  useEffect(() => {
    const onPageLoad = () => {
      initialisation();
    };
    // Check if the page has already loaded
    if (document.readyState === 'complete') {
      onPageLoad();
    } else {
      window.addEventListener('load', onPageLoad);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener('load', onPageLoad);
    }
    document.addEventListener("keydown", (e) => OnKeyDown(e));
    document.addEventListener("keyup", (e) => OnKeyUp(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div id="menu"><input id="startGame" type="button" value="Start Game" onClick={OnStartGameClickButton}/></div>
      <div id="divGame"></div>
    </div>
  )
};

export default Game;