import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ip } from '../../App';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';
import { GameClass } from './gameClass';
import GamePage from './GamePage';
import MapSelector from './MapSelector';
import "./Pong.scss"
import { io } from "socket.io-client";
import SpectatorPage from './Spectator';
// import WatchingListGame from './WatchingListGame';


const Pong = (props : any) => {
    const utils = useSelector((state: RootState) => state.utils);
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [verif, setVerif] = useState(false);
    const [gameStart, setGameStart] = useState(false);
    const [waitingOponnent, setWaitingOponnent] = useState(false);
    const [spectator, setSpectator] = useState(false);
    const [roomID, setRoomID] = useState("");

    useEffect(() => {
        if (!verif)
        {
            console.log("Check reco front", persistantReducer.userReducer.user?.username);
            utils.gameSocket.emit('CHECK_RECONNEXION', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '');
            setVerif(true)
        }
    })

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

