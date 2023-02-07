import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import { GameClass } from './gameClass';
import "./Pong.scss"
import { NavLink } from 'react-router-dom';
import { Button } from '@mui/material';

var canvas = {
    "width": document.body.clientWidth,
    "height": document.body.clientHeight
}

const SpectatorPage = (props: any) => {
    const utils = useSelector((state: RootState) => state.utils);
    const [finishGame, setFinishGame] = useState(false);
    const [finishRoom, setFinishRoom] = useState<GameClass | undefined>(undefined);
    const [draw, setDraw] = useState(false);
    const [verif, setVerif] = useState(false)
    useEffect(() => {
        if (!verif) {
            utils.gameSocket.emit('START_SPECTATE', { roomID: props.roomID, start: false })
            setVerif(true);
        }
    })
    if (verif)
        setInterval(() => { utils.gameSocket.emit('START_SPECTATE', { roomID: props.roomID, start: true }) }, 16)

    utils.gameSocket.removeListener("start_spectate");
    utils.gameSocket.on("start_spectate", (room: GameClass) => { render(room); });

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
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.fillText(room.players[0].username, room.players[0].posX + room.players[0].width / 2, room.players[0].posY - 10);
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.fillText(room.players[1].username, room.players[1].posX + room.players[1].width / 2, room.players[1].posY - 10);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.players[0].posX, room.players[0].posY, room.players[0].width, room.players[0].height);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.players[1].posX, room.players[1].posY, room.players[1].width, room.players[1].height);
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
            ctx.font = 'bold 50px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.fillText("Players Not ready", canvas.width / 2, canvas.height / 2);
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
                if (room.players[0].score !== 0 || room.players[1].score !== 0)
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

    utils.gameSocket.on('finish', (data: { room: GameClass, draw: boolean }) => {
        console.log('finish front')
        setDraw(data.draw);
        setFinishGame(true)
        setFinishRoom(data.room)
    });

    function affFinishScreen() {
        let player0, player1;

        player0 = finishRoom?.players[0]
        player1 = finishRoom?.players[1]
        if (draw === true) {
            return (
                <div className='game-finished'>
                    <h1 className='draw'>Winner is {player0?.score === 3 ? player0.username : player1?.username}</h1>
                    <div className='result'>
                        <p><b>Due to inactivity</b></p>
                    </div>
                    <div className='result'>
                        <p><b>{player0?.username} : </b> {player0?.score}</p>
                        <p><b>{player1?.username} : </b> {player1?.score}</p>
                    </div>
                    <NavLink to='/' className="btnPlay">
                        <Button className="btn2">
                            Home
                        </Button>
                    </NavLink>
                </div>
            )
        }
        return (
            <div className='game-finished'>
                <h1>Winner is {player0?.score === 3 ? player0.username : player1?.username}</h1>
                <div className='result'>
                    <p><b>{player0?.username} : </b> {player0?.score}</p>
                    <p><b>{player1?.username} : </b> {player1?.score}</p>
                </div>
                <NavLink to='/' className="btnPlay">
                    <Button className="btn2">
                        Home
                    </Button>
                </NavLink>
            </div>
        )

    }

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

export default SpectatorPage;
