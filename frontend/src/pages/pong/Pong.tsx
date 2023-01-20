import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSocket } from '../../App';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';
import GamePage from './GamePage';
import MapSelector from './MapSelector';
import "./Pong.scss"

const Pong = (props : any) => {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [verif, setVerif] = useState(false);
    const [gameStart, setGameStart] = useState(false);
    const [waitingOponnent, setWaitingOponnent] = useState(false);
    const [roomID, setRoomID] = useState("");

    useEffect(() => {
        if (!verif)
        {
            gameSocket.emit('UPDATE_USER', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '');
            setVerif(true)
        }
    })

    if (gameStart) return (
        <div>
            <Navbar />
            <GamePage gameStart={gameStart} setGameStart={setGameStart} roomID={roomID} />
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
            />
        </div>
    );
};


export default Pong;

