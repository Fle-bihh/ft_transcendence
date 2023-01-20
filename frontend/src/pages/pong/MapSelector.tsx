import { useSelector } from 'react-redux';
import { gameSocket } from '../../App';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';

function MapSelector(props : any) {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

    function startGame() {
        console.log("start game front");
		gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.username}, gameMap: "map1" });
	}

    gameSocket.removeListener("start");
    gameSocket.on('start', function (roomID: string) {
		console.log('start 2 front')
        props.setRoomID(roomID);
		props.setGameStart(true);
	});

    gameSocket.removeListener("joinRoom");
    gameSocket.on('joinRoom', function (roomID: string) {
		gameSocket.emit('JOIN_ROOM', roomID)
	});

    gameSocket.removeListener("joined_waiting");
    gameSocket.on('joined_waiting', function (user : { login : string }) {
		props.setWaitingOponnent(true)
	});

    return (
        <div>
            <Navbar />
            <span className="span" ></span>
            <button className='join-queue' type='button' onClick={startGame}>Join queue</button>
            <p>socket : {gameSocket.id}</p>
        </div>
    )
}


export default MapSelector;

