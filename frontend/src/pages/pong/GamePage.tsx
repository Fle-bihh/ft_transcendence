import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import { GameClass } from './gameClass';
import "./Pong.scss"

var canvas = {
    "width": 800,
    "height": 600
}

const GamePage = (props: any) => {

    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [finishGame, setFinishGame] = useState(false);
    const [finishRoom, setFinishRoom] = useState<GameClass | undefined>(undefined);
    const utilsData = useSelector((state: RootState) => state.utils);

    function drawFont(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {

            ctx.fillStyle = 'rgb(245, 246, 247)';

            ctx.fillRect(0, 0, canvas.width, canvas.height);

        }
    }

    function drawBall(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {

            ctx.beginPath();

            ctx.fillStyle = 'rgb(48, 56, 76)';

            ctx.arc(room.ball.posX, room.ball.posY, room.ball.radius, 0, Math.PI * 2);

            ctx.fill();

            ctx.shadowBlur = 0;

        }
    }

    function drawPlayers(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            const currentPlayer = room.players.find(item => item.username == persistantReducer.userReducer.user?.login)
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";
            if (currentPlayer != undefined)
                ctx.fillText("YOU", currentPlayer!.posX + currentPlayer!.width / 2, currentPlayer!.posY - 10);
            ctx.fillStyle = 'rgb(48, 56, 76)';
            ctx.fillRect(room.players[0].posX, room.players[0].posY, room.players[0].width, room.players[0].height);
            ctx.fillStyle = 'rgb(48, 56, 76)';
            ctx.fillRect(room.players[1].posX, room.players[1].posY, room.players[1].width, room.players[1].height);
            ctx.shadowBlur = 0;
        }
    }

    function drawScore(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.textAlign = 'center';
            ctx.font = '50px Arial';
            ctx.fillStyle = 'black'
            ctx.fillText(room.players[0].score.toString(), canvas.width / 4 + canvas.width / 16, canvas.height / 10);
            ctx.fillStyle = 'black'
            ctx.fillText(room.players[1].score.toString(), (canvas.width / 4 * 3) - canvas.width / 16, canvas.height / 10);
        }
    }

    function drawLimitsMove(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgb(48, 56, 76)';
            ctx.moveTo(canvas.width / 8, 0);
            ctx.lineTo(canvas.width / 8, canvas.height);
            ctx.moveTo((canvas.width / 8) * 7, 0);
            ctx.lineTo((canvas.width / 8) * 7, canvas.height);
            ctx.stroke();
            ctx.fill();
        }
    }

    function drawLimitCamps(ctx: CanvasRenderingContext2D | null) {
        if (ctx !== null) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgb(48, 56, 76)';
            ctx.setLineDash([canvas.height / 30, canvas.height / 120]);
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawText(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {

            ctx.font = 'bold 50px Arial';
            ctx.fillStyle = 'rgb(48, 56, 76)';
            ctx.textAlign = "center";

            // if (!room.players[0].connected || !room.players[1].connected) {
            //     ctx.fillText("Opponent disconnected.", canvas.width / 2, canvas.height / 3);
            //     ctx.fillText((15 - Math.floor((Date.now() - room.players[room.players[0].connected ? 1 : 0].dateDeconnection) / 1000)).toString(), canvas.width / 2, canvas.height / 2);
            // }
            // else
                ctx.fillText("Press ENTER to play !", canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = 'black';
            ctx.fillRect(canvas.width / 6 - canvas.width / 48, canvas.height / 8 * 5, canvas.width / 3, canvas.height / 8);
            ctx.fillRect(canvas.width / 6 * 3 + canvas.width / 48, canvas.height / 8 * 5, canvas.width / 3, canvas.height / 8);
            ctx.fillStyle = (room.players[0].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)');
            ctx.fillRect(canvas.width / 6 - canvas.width / 48 + 5, canvas.height / 8 * 5 + 5, canvas.width / 3 - 10, canvas.height / 8 - 10);
            ctx.fillStyle = (room.players[1].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)');
            ctx.fillRect(canvas.width / 6 * 3 + canvas.width / 48 + 5, canvas.height / 8 * 5 + 5, canvas.width / 3 - 10, canvas.height / 8 - 10);
            ctx.font = 'bold 50px Arial';
            ctx.textAlign = "center";
            if (room.players[0].username == persistantReducer.userReducer.user!.login) {
                ctx.fillStyle = !room.players[0].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("YOU", canvas.width / 6 - canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
                ctx.fillStyle = !room.players[1].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("HIM", canvas.width / 6 * 3 + canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
            }
            else {
                ctx.fillStyle = !room.players[1].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("YOU", canvas.width / 6 * 3 + canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
                ctx.fillStyle = !room.players[0].ready ? 'rgb(48, 56, 76)' : 'rgb(244, 246, 247)';
                ctx.fillText("HIM", canvas.width / 6 - canvas.width / 48 + canvas.width / 6, canvas.height / 8 * 5 + canvas.height / 32 * 3);
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
                console.log('player 1 : ', room.players[0].ready)
                console.log('player 2 : ', room.players[1].ready)
                resetCanvas()
                drawFont(ctx, room)
                drawLimitsMove(ctx)
                if (room.players[0].ready && room.players[1].ready) {
                    drawLimitCamps(ctx)
                }
                drawScore(ctx, room)
                if (!room.players[0].ready || !room.players[1].ready) {
                    drawText(ctx, room)
                    return
                }
                drawBall(ctx, room)
                drawPlayers(ctx, room)
            }
        }
    }

    utilsData.socket.on('render', function (room: GameClass) {
        render(room)
    });

    utilsData.socket.on('finish', (room: GameClass) => {
        setFinishGame(true)
        setFinishRoom(room)
    });
   
    function onKeyDown(e: any) {
        if (e.key === 'ArrowUp')
            utilsData.socket.emit('ARROW_UP', [props.roomID, true]);
        if (e.key === 'ArrowDown')
            utilsData.socket.emit('ARROW_DOWN', [props.roomID, true]);
        if (e.key === 'Enter') {
            utilsData.socket.emit('ENTER', [props.roomID, true]);
        }
    }

    function onKeyUp(e: any) {
        if (e.key === 'ArrowUp')
            utilsData.socket.emit('ARROW_UP', [props.roomID, false]);
        if (e.key === 'ArrowDown')
            utilsData.socket.emit('ARROW_DOWN', [props.roomID, false]);
    }

    function affFinishScreen() {
        let U, H;
        setTimeout(function () {
            window.location.replace('https://localhost:3000');
        }, 5000);

        if (finishRoom?.players[0].username == persistantReducer.userReducer.user?.login) {
            U = finishRoom?.players[0]
            H = finishRoom?.players[1]
        } else {
            U = finishRoom?.players[1]
            H = finishRoom?.players[0]
        }

        return (
            <div className='game-finished'>
                <h1>{U?.score === 3 ? 'Victory' : 'Defeat'}</h1>
                <div className='result'>
                    <span>
                        <p>YOU</p>
                    </span>
                    <span>
                        {U?.score} - {H?.score}
                    </span>
                    <span>
                        <p>HIM</p>
                    </span>
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

    setInterval(() => {
        utilsData.socket.emit('RENDER', props.roomID);
    }, 50)

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