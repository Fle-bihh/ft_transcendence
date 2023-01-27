import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { GameClass } from './gameClass';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ListItemButton, ListItemIcon } from '@mui/material';

export default function WatchingListGame(props  : {
    all_rooms : Array<GameClass>
    setRoomID : any
    setSpectator : any
}) {
    let room_map1: Array<GameClass> = new Array();
    let room_map2: Array<GameClass> = new Array();
    let room_map3: Array<GameClass> = new Array();
    let rooms : Array<GameClass []> = new Array();
    
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

  return (
    <div>
        <List sx={{ alignItems:'center' , width: '100%', maxWidth: 360, bgcolor: 'background.paper', position: 'relative', overflow: 'auto', maxHeight: 300, '& ul': { padding: 0 }, }} subheader={<li />} >
        {rooms.map((room_arr) => (
            <div>
                <li key={`section-${rooms.indexOf(room_arr)}`}>
                    <ul>
                        <ListSubheader>{`Map ${rooms.indexOf(room_arr) + 1}`}</ListSubheader>
                        {room_arr.map((room) => (
                            <ListItemButton key={`item-${rooms.indexOf(room_arr)}-${room.roomID}`} onClick={() => {
                                props.setRoomID(room.roomID);
                                props.setSpectator(true)}}>
                                <ListItemText primary={`Room ${room.players[0].username} : ${room.players[1].username}`} />
                                <ListItemIcon>
                                    <VisibilityIcon />
                                </ListItemIcon>
                            </ListItemButton>
                        ))}
                    </ul>
                </li>
            </div>
        ))}
        </List>
    </div>
  );
}