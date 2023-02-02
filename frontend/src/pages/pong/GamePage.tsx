import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSocket } from '../../App';
import { RootState } from '../../state';
import { GameClass } from './gameClass';
import { ip } from '../../App';
import "./Pong.scss"

var canvas = {
    "width": 800,
    "height": 600
}

const GamePage = (props: any) => {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [finishGame, setFinishGame] = useState(false);
    const [finishRoom, setFinishRoom] = useState<GameClass | undefined>(undefined);

    function drawFont(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.fillStyle = room.map.mapColor;
            ctx.fillRect(0, 0, room.canvas.width, room.canvas.height);
        }
    }

    function drawBall(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.beginPath();
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.arc(room.ball.posX, room.ball.posY, room.ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function drawPlayers(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            console.log(room)
            const currentPlayer = room.players.find(item => item.username == persistantReducer.userReducer.user?.username)
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            if (currentPlayer != undefined)
                ctx.fillText("YOU", currentPlayer!.posX + currentPlayer!.width / 2, currentPlayer!.posY - 10);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.players[0].posX, room.players[0].posY, room.players[0].width, room.players[0].height);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.players[1].posX, room.players[1].posY, room.players[1].width, room.players[1].height);
            ctx.shadowBlur = 0;
        }
    }

    function drawObstacle(ctx: CanvasRenderingContext2D | null, room: GameClass){
        if (ctx !== null) {
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.map.mapObstacles[0].posX,room.map.mapObstacles[0].posY, room.map.mapObstacles[0].width, room.map.mapObstacles[0].height);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.map.mapObstacles[1].posX,room.map.mapObstacles[1].posY, room.map.mapObstacles[1].width, room.map.mapObstacles[1].height);
            ctx.shadowBlur = 0;
        }
    }

    function drawScore(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.textAlign = 'center'
            ctx.font = '50px Arial'
            ctx.fillStyle = 'white'
            ctx.fillText(room.players[0].score.toString(), canvas.width / 4 + canvas.width / 16, canvas.height / 10);
            ctx.fillStyle = 'white'
            ctx.fillText(room.players[1].score.toString(), (canvas.width / 4 * 3) - canvas.width / 16, canvas.height / 10);
        }
    }

    function drawLimitCamps(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.setLineDash([canvas.height / 30, canvas.height / 120]);
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawText(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            const index_p = persistantReducer.userReducer.user!.username == room.players[0].username ? 0 : 1
            if (!room.players[index_p].ready) {
                ctx.font = 'bold 50px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = "center";
                ctx.fillText("Press ENTER to play !", canvas.width / 2, canvas.height / 2);
            }
            else {
                if (!room.players[index_p * -1 + 1].ready) {
                    ctx.font = 'bold 50px Arial';
                    ctx.fillStyle = 'white';
                    ctx.textAlign = "center";
                    ctx.fillText("Wainting for the opponent !", canvas.width / 2, canvas.height / 2);
                }
            }
        }
    }

    

    function resetCanvas() {
        var canvas = document.getElementById('pongCanvas') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }
    }

    function render(room: GameClass) {
        var canvas = document.getElementById('pongCanvas') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {
                resetCanvas()
                drawFont(ctx, room)
                if (room.players[0].ready && room.players[1].ready) {
                    drawLimitCamps(ctx)
                }
                if (room.players[0].score != 0 || room.players[1].score != 0)
                    drawScore(ctx, room)
                if (!room.players[0].ready || !room.players[1].ready) {
                    drawText(ctx, room)
                    return
                }
                if(room.map.useObstacle){
                    drawObstacle(ctx, room)
                }
                drawBall(ctx, room)
                drawPlayers(ctx, room)
            }
        }
    }

    gameSocket.on('render', function (room: GameClass) {
        render(room)
    });

    gameSocket.on('finish', (room: GameClass) => {
        console.log('finish front')
        setFinishGame(true)
        setFinishRoom(room)
    });
   
    function onKeyDown(e: any) {
        if (e.key === 'ArrowUp')
            gameSocket.emit('ARROW_UP', [props.roomID, true]);
        if (e.key === 'ArrowDown')
            gameSocket.emit('ARROW_DOWN', [props.roomID, true]);
        if (e.key === 'Enter') {
            gameSocket.emit('ENTER', [props.roomID, true]);
        }
    }

    function onKeyUp(e: any) {
        if (e.key === 'ArrowUp')
            gameSocket.emit('ARROW_UP', [props.roomID, false]);
        if (e.key === 'ArrowDown')
            gameSocket.emit('ARROW_DOWN', [props.roomID, false]);
    }

    function affFinishScreen() {
        let U, H;
        setTimeout(function () {
            window.location.replace(`http://${ip}:3000`);
        }, 10000);

        if (finishRoom?.players[0].username == persistantReducer.userReducer.user?.username) {
            U = finishRoom?.players[0]
            H = finishRoom?.players[1]
        } else {
            U = finishRoom?.players[1]
            H = finishRoom?.players[0]
        }

        return (
            <div className='game-finished'>
                <h1 className={U?.score === 3 ? 'victory' : 'defeat'}>{U?.score === 3 ? 'You Win !' : 'You Lose !'}</h1>
                <div className='result'>      
                    <p><b>YOU :</b> {U?.score}</p> 
                    <p><b>HIM :</b> {H?.score}</p>
                </div>
            </div>
        )

    }
    const [verif, setVerif] = useState(false)
    useEffect(() => {
        if (!verif) {
            document.addEventListener("keydown", onKeyDown);
            document.addEventListener("keyup", onKeyUp);
            setVerif(true);
        }
    })

    return (
        <div className="mainDiv">
            {
                !finishGame ?
                    <div className="boardDiv">
                        <div className="blocksContainerCenter">
                            <canvas
                                id='pongCanvas'
                                className='pongCanvas'
                                height={canvas.height}
                                width={canvas.width}
                            />
                        </div>
                    </div>
                    :
                    <>{affFinishScreen()}</>
            }
        </div>
    );
};

export default GamePage;
