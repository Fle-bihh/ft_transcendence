import { useEffect, useState } from 'react';
import Navbar from '../../components/nav/Nav';
import GamePage from './GamePage';
import MapSelector from './MapSelector';
import "./Pong.scss"
import SpectatorPage from './Spectator';
import waiting from "../../styles/asset/Loading.gif";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';


const Pong = () => {
    const location = useLocation();
    const [gameStart, setGameStart] = useState(false);
    const [waitingOponnent, setWaitingOponnent] = useState(false);
    const [spectator, setSpectator] = useState(false);
    const [roomID, setRoomID] = useState("");
    const userReducer = useSelector((state: RootState) => state.persistantReducer.userReducer);
    const utilsReducer = useSelector((state: RootState) => state.utils);
    useEffect(() => {
        if (userReducer.user)
        {
        //   utilsReducer.socket.emit("STORE_CLIENT_INFO", { user: userReducer.user });
            utilsReducer.gameSocket.emit("CHECK_RECONNEXION", {username : userReducer.user?.username});
        }
    }, []);

    if (location.state && location.state.invite === true) return (
        <div>
            <Navbar />
            <GamePage roomID={location.state.roomId}/>
        </div>
    )
    else if (location.state && location.state.spectate === true) return (
        <div>
            <Navbar />
            <SpectatorPage roomID={location.state.roomId}/>
        </div>
    )
    else if (gameStart) return (
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
            <div className='waiting_div'>
                <h1 className='waiting_txt'>Waiting for an oponnent</h1>
                <img src={waiting} alt='waitRoom' className='waiting_pict'></img>
            </div>
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

