import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';

function MapSelector(props : any) {
    const utilsData = useSelector((state: RootState) => state.utils);
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

    function startGame() {
        console.log("start game front");
		utilsData.socket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.login}, gameMap: "0" });
	}

    utilsData.socket.on('start', function (roomID: string) {
		console.log('start 2 front')
        props.setRoomID(roomID);
		props.setGameStart(true);
	});

    utilsData.socket.on('joinRoom', function (roomID: string) {
		utilsData.socket.emit('JOIN_ROOM', roomID)
	});

    return (
        <div>
            <Navbar />
            <span className="span" ></span>
            <button className='join-queue' type='button' onClick={startGame}>Join queue</button>
            <p>socket : {utilsData.socket.id}</p>
        </div>
    )
}


export default MapSelector;

