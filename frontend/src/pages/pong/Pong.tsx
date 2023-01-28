import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSocket } from '../../App';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';
import { GameClass } from './gameClass';
import GamePage from './GamePage';
import MapSelector from './MapSelector';
import "./Pong.scss"
import SpectatorPage from './Spectator';
// import WatchingListGame from './WatchingListGame';

const Pong = (props : any) => {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [verif, setVerif] = useState(false);
    const [gameStart, setGameStart] = useState(false);
    // const [allrooms, setAllRooms] = useState(Array<GameClass>);
    // const [listGame, setListGame] = useState("");
    const [waitingOponnent, setWaitingOponnent] = useState(false);
    const [spectator, setSpectator] = useState(false);
    const [roomID, setRoomID] = useState("");

    useEffect(() => {
        if (!verif)
        {
            console.log("Check reco front", persistantReducer.userReducer.user?.username);
            gameSocket.emit('CHECK_RECONNEXION', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '');
            setVerif(true)
        }
    })
    
    // gameSocket.removeListener("set_list_game");
    // gameSocket.on('set_list_game', function (gameExist : string) {
	// 	if (gameExist == 'yes')
    //         setListGame('yes');
    //     else if (gameExist == 'noGame')
    //         setListGame('noGame');
	// });

    // gameSocket.removeListener("add_room_playing");
    // gameSocket.on('add_room_playing', function (room : GameClass) {
	// 	console.log("Socket add room playing receved in watching");
	// 	console.log("room : ", room);
    //     allrooms.push(room);
	// 	console.log("allrooms : ", allrooms);
	// });

    // function affishListGame() {
    //     console.log("affish allrooms : ", allrooms);
    //     if (listGame == 'yes') return (
    //         <WatchingListGame all_rooms={allrooms} setRoomID={setRoomID} setSpectator={setSpectator}/>
    //     )
    //     else return (
    //         <Box>
    //             <Box alignContent={"center"} sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 100, width: '100%', }}>
    //                 <Button variant="outlined" onClick={() => {
    //                     gameSocket.emit('SEE_LIST_GAME', persistantReducer.userReducer.user?.username);
    //                 }}>Refresh the list of Live Game</Button>
    //             </Box>
    //             <Box>
    //                 <p>No game</p>
    //             </Box>
    //         </Box>
    //     )
    // }

    if (gameStart) return (
        <div>
            <Navbar />
            <GamePage gameStart={gameStart} setGameStart={setGameStart} roomID={roomID} />
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
            // setListGame={setListGame}
            // listGame={listGame}
            // setAllRooms={setAllRooms}
            // all_rooms={allrooms} // ????
            setSpectator={setSpectator}
            />
            {/* { listGame == "yes" ?
                <></>
                // <WatchingListGame all_rooms={allrooms} setRoomID={setRoomID} setSpectator={setSpectator}/>
                : <></>
            } */}
        </div>
    );
};


export default Pong;

