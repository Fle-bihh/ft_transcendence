import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { GameClass } from './gameClass';
import { gameSocket } from '../../App';

export default function WatchingGame(props  : {
    all_rooms : Array<GameClass>
}) {
    let room_map1: Array<GameClass> = new Array();
    let room_map2: Array<GameClass> = new Array();
    let room_map3: Array<GameClass> = new Array();
    let rooms : Array<GameClass []> = new Array();
    // let allrooms : Array<GameClass> = new Array();
    props.all_rooms.map((room) => {
        if (room.map.mapName == "map1")
            room_map1.push(room);
        else if (room.map.mapName == "map2")
            room_map2.push(room);
        else if (room.map.mapName == "map3")
            room_map3.push(room);
    })
    if (room_map1.length != 0)
        rooms.push(room_map1);
    if (room_map2.length != 0)
        rooms.push(room_map2);
    if (room_map3.length != 0)
        rooms.push(room_map3);
    //update quand y a une nouvelle room ?????

    // gameSocket.removeListener("add_room_playing");
    // gameSocket.on('add_room_playing', function (room : GameClass) {
	// 	console.log("Socket add room playing receved in watching");
	// 	console.log("room : ", room);
    //     if (room.map.mapName == "map1")
    //         room_map1.push(room);
    //     else if (room.map.mapName == "map2")
    //         room_map2.push(room);
    //     else if (room.map.mapName == "map3")
    //         room_map3.push(room);
	// });

    // gameSocket.removeListener("get_rooms_playing");
    // gameSocket.on('get_rooms_playing', function (rooms : Array<GameClass>) {
	// 	console.log("Socket Get rooms playing receved in watching");
	// 	console.log("rooms : ", rooms);
    //     rooms.map((room) => { allrooms.push(room); })
	// 	console.log("all_rooms watching.tsx : ", allrooms);
	// });
    console.log("rooms: ", rooms);
    console.log("room_map1: ", room_map1);
    console.log("room_map2: ", room_map2);
    console.log("room_map3: ", room_map3);

  return (
    <div>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 300, '& ul': { padding: 0 }, }} subheader={<li />} >
        <p>`see the rooooooms :` {rooms} end</p>
        {rooms.map((room_arr) => (
            <div>
                <p>`see the rooooooms : {rooms.indexOf(room_arr)}`</p>
                <li key={`section-${room_arr}`}>
                    <ul>
                        <ListSubheader>{`Map ${rooms.indexOf(room_arr) + 1}`}</ListSubheader>
                        {room_arr.map((room) => (
                        <ListItem key={`item-${room_arr}-${room}`}>
                            <ListItemText primary={`Room ${room.players[0].username} : ${room.players[1].username}`} />
                        </ListItem>
                        ))}
                    </ul>
                </li>
            </div>
        ))}
        </List>
        <p>list of rooms</p>
    </div>
  );
}