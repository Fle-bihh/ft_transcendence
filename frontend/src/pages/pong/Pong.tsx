import { useState } from 'react';
import Navbar from '../../components/nav/Nav';
import GamePage from './GamePage';
import MapSelector from './MapSelector';
import "./Pong.scss"
import SpectatorPage from './Spectator';

const Pong = () => {
    const [gameStart, setGameStart] = useState(false);
    const [waitingOponnent, setWaitingOponnent] = useState(false);
    const [spectator, setSpectator] = useState(false);
    const [roomID, setRoomID] = useState("");

    if (gameStart) return (
        <div>
            <Navbar />
            <GamePage gameStart={gameStart} setGameStart={setGameStart} roomID={roomID}/>
        </div>
    )
    else if (spectator) return (
        <div>
            <Navbar />
            <SpectatorPage roomID={roomID}/>
        </div>
    )
    else if (waitingOponnent) return (
        <div>
            <Navbar/>
            <p>Waiting for an oponnent</p>
        </div>
    )
    else return (
        <div>
            <Navbar/>
            <MapSelector 
            setGameStart = {setGameStart}
            setRoomID = {setRoomID}
            setWaitingOponnent = {setWaitingOponnent}
            setSpectator={setSpectator}
            />
        </div>
    );
};


export default Pong;

