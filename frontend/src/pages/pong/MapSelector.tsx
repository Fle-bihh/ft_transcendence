import { useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSocket } from '../../App';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';
import Version0 from "../../styles/asset/Version0.gif";
import Version1 from "../../styles/asset/Version1.gif";
import Version2 from "../../styles/asset/Version2.gif";
import Version3 from "../../styles/asset/Version3.gif";
import Version4 from "../../styles/asset/Version4.gif";
import Version5 from "../../styles/asset/Version5.gif";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { GameClass } from './gameClass';
import WatchingListGame from './WatchingListGame';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


function MapSelector(props: any) {
    const [allRooms, setAllRooms] = useState(Array<GameClass>);
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
    const [listGame, setListGame] = useState("");
    const [open, setOpen] = React.useState(false);

    function startGame1() {
        console.log("start game front 1");
        gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.username }, gameMap: "map1" });
    }
    function startGame2() {
        console.log("start game front 2");
        gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.username }, gameMap: "map2" });
    }
    function startGame3() {
        console.log("start game front 3");
        gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.username }, gameMap: "map3" });
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
    gameSocket.on('joined_waiting', function (user: { login: string }) {
        props.setWaitingOponnent(true)
    });

    gameSocket.removeListener("set_list_game");
    gameSocket.on('set_list_game', function (gameExist: string) {
        console.log("see_list_game : ", gameExist);
        if (gameExist == 'yes')
            setListGame('yes');
        else if (gameExist == 'noGame')
            setListGame('noGame');
    });

    gameSocket.removeListener("add_room_playing");
    gameSocket.on('add_room_playing', function (room: GameClass) {
        console.log("Socket add room playing receved in watching");
        console.log("room : ", room);
        console.log("allRooms : ", allRooms);
        allRooms.push(room);
        allRooms.push(room);
        // props.setAllRooms(allRooms);
        console.log("allRooms : ", allRooms);
    });

    function affishListGame() {
        if (listGame == 'yes') return (
            <WatchingListGame all_rooms={allRooms} setRoomID={props.setRoomID} setSpectator={props.setSpectator}/>
        )
        else return (
            <ImageButton focusRipple key={images[5].title} style={{ width: images[5].width }} onClick={() => { gameSocket.emit('SEE_LIST_GAME', persistantReducer.userReducer.user?.username); }}>
                <ImageSrc style={{ backgroundImage: `url(${images[5].url})`, backgroundSize: `contain` }} />
                <ImageBackdrop className="MuiImageBackdrop-root" />
                <Image>
                    <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                        {images[5].title} <ImageMarked className="MuiImageMarked-root" />
                    </Typography>
                </Image>
            </ImageButton>
        )
    }

    const images = [
        { url: Version0, title: 'Play Map 1', width: '33.33%' },
        { url: Version1, title: 'Play Map 2', width: '33.33%' },
        { url: Version2, title: 'Play Map 3', width: '33.33%' },
        { url: Version3, title: 'Invite a player', width: '50%' },
        { url: Version4, title: 'Watch live games', width: '50%' },
        { url: Version5, title: 'No one is playing', width: '50%' },
    ];

    const ImageButton = styled(ButtonBase)(({ theme }) => ({
        position: 'relative', height: 200, [theme.breakpoints.down('sm')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &.Mui-focusVisible': {
            zIndex: 1, '& .MuiImageBackdrop-root': { opacity: 0.15, },
            '& .MuiImageMarked-root': { opacity: 0, },
            '& .MuiTypography-root': { border: '4px solid currentColor', },
        },
    }));

    const ImageSrc = styled('span')({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundPosition: 'center 4%',
    });

    const Image = styled('span')(({ theme }) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
        border: '5px solid',
        borderColor: 'white',
    }));

    const ImageBackdrop = styled('span')(({ theme }) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
        transition: theme.transitions.create('opacity'),
    }));

    const ImageMarked = styled('span')(({ theme }) => ({
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    }));

    const handleInvite = () => {
        console.log("coucou");
    };

    return (
        <React.Fragment>
            <Box paddingTop={"10%"} paddingBottom={"5%"}>
                <Typography align="center" variant="h1" sx={{ fontWeight: 900 }} >
                    <b style={{ color: 'black' }}>Jouez au Pong</b>
                </Typography>
                <Typography align="center" variant={"body1"} pt={8}>
                    Choisissez votre version du jeu !!
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 100, width: '100%', }}>
                <ImageButton focusRipple key={images[0].title} style={{ width: images[0].width }} onClick={startGame1}>
                    <ImageSrc style={{ backgroundImage: `url(${images[0].url})` }} />
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                            {images[0].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
                <ImageButton focusRipple key={images[1].title} style={{ width: images[1].width }} onClick={startGame2}>
                    <ImageSrc style={{ backgroundImage: `url(${images[1].url})` }} />
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                            {images[1].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
                <ImageButton focusRipple key={images[2].title} style={{ width: images[2].width }} onClick={startGame3}>
                    <ImageSrc style={{ backgroundImage: `url(${images[2].url})` }} />
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                            {images[2].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
            </Box>
            <Box alignContent={"center"} sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 100, width: '100%', }}>
                {listGame == "" ?
                    <ImageButton focusRipple key={images[4].title} style={{ width: images[4].width }} onClick={() => { gameSocket.emit('SEE_LIST_GAME', persistantReducer.userReducer.user?.username); }}>
                        <ImageSrc style={{ backgroundImage: `url(${images[4].url})`, backgroundSize: `contain` }} />
                        <ImageBackdrop className="MuiImageBackdrop-root" />
                        <Image>
                            <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                                {images[4].title} <ImageMarked className="MuiImageMarked-root" />
                            </Typography>
                        </Image>
                    </ImageButton> :
                    <>{affishListGame()}</>
                }
                <ImageButton focusRipple key={images[3].title} style={{ width: images[3].width }} onClick={handleInvite}>
                    <ImageSrc style={{ backgroundImage: `url(${images[3].url})` }} />
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                            {images[3].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
            </Box>
        </React.Fragment>
    )
}


export default MapSelector;

