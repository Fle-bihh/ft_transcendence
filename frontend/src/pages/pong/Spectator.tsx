import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';
import { GameClass } from './gameClass';
import "./Pong.scss"
import { NavLink } from 'react-router-dom';
import { Button } from '@mui/material';

const SpectatorPage = (props: {
    roomID : string
}) => {
    const utils = useSelector((state: RootState) => state.utils);
    const [finishGame, setFinishGame] = useState(false);
    const [finishRoom, setFinishRoom] = useState<GameClass | undefined>(undefined);
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [draw, setDraw] = useState(false);
    const [verif, setVerif] = useState(false)
    useEffect(() => {
        if (!verif) {
            utils.gameSocket.emit('START_SPECTATE', { username: persistantReducer.userReducer.user?.username, roomID: props.roomID, start: false })
            setVerif(true);
        }
    }, [verif, utils.gameSocket, persistantReducer.userReducer.user?.username, props.roomID]);

    if (verif)
        setInterval(() => { utils.gameSocket.emit('START_SPECTATE', { username: persistantReducer.userReducer.user?.username, roomID: props.roomID, start: true }) }, 16)

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

    function drawObstacle(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.map.mapObstacles[0].posX, room.map.mapObstacles[0].posY, room.map.mapObstacles[0].width, room.map.mapObstacles[0].height);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(room.map.mapObstacles[1].posX, room.map.mapObstacles[1].posY, room.map.mapObstacles[1].width, room.map.mapObstacles[1].height);
            ctx.shadowBlur = 0;
        }
    }

    function drawScore(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.textAlign = 'center'
            ctx.font = '50px Arial'
            ctx.fillStyle = 'white'
            ctx.fillText(room.players[0].score.toString(), room.canvas.width / 4 + room.canvas.width / 16, room.canvas.height / 10);
            ctx.fillStyle = 'white'
            ctx.fillText(room.players[1].score.toString(), (room.canvas.width / 4 * 3) - room.canvas.width / 16, room.canvas.height / 10);
        }
    }

    function drawLimitCamps(ctx: CanvasRenderingContext2D | null, room : GameClass) {
        if (ctx !== null) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.setLineDash([room.canvas.height / 30, room.canvas.height / 120]);
            ctx.moveTo(room.canvas.width / 2, 0);
            ctx.lineTo(room.canvas.width / 2, room.canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawText(ctx: CanvasRenderingContext2D | null, room: GameClass) {
        if (ctx !== null) {
            ctx.font = 'bold 50px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.fillText("Players Not ready", room.canvas.width / 2, room.canvas.height / 2);
        }
    }

    function resetCanvas(room : GameClass) {
        var canvas = document.getElementById('pongCanvas') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {
                ctx.clearRect(0, 0, room.canvas.width, room.canvas.height)
            }
        }
    }

    function render(room: GameClass) {
        var canvas = document.getElementById('pongCanvas') as HTMLCanvasElement
        if (canvas !== null) {
            var ctx = canvas.getContext('2d')
            if (ctx !== null) {
                resetCanvas(room)
                drawFont(ctx, room)
                if (room.players[0].ready && room.players[1].ready) {
                    drawLimitCamps(ctx, room) 
                }
                if (room.players[0].score !== 0 || room.players[1].score !== 0)
                    drawScore(ctx, room)
                }
                if (!room.players[0].ready || !room.players[1].ready) {
                    drawText(ctx, room)
                    return
                }
                if (room.map.useObstacle) {
                    drawObstacle(ctx, room)
                }
                drawBall(ctx, room)
                drawPlayers(ctx, room)
            }
        }

    utils.gameSocket.on('finish', (data: { room: GameClass, draw: boolean }) => {
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
                                width="800px"
                                height="600px"
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
