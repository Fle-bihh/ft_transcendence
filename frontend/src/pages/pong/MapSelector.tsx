import { useState } from 'react';
import { useSelector } from 'react-redux';
import { gameSocket } from '../../App';
import Navbar from '../../components/nav/Nav';
import { RootState } from '../../state';
import Version1 from "../../styles/asset/gif_pong.gif";
import Version2 from "../../styles/asset/Version2.gif";
import Version3 from "../../styles/asset/Version3.gif";
import {NavLink} from "react-router-dom";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

function MapSelector(props : any) {
    const persistantReducer = useSelector((state: RootState) => state.persistantReducer);

    function startGame1() {
        console.log("start game front 1");
        gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.login}, gameMap: "map1" });
	}
    function startGame2() {
        console.log("start game front 2");
        gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.login}, gameMap: "map2" });
	}
    function startGame3() {
        console.log("start game front 3");
        gameSocket.emit('START_GAME', { user: { login: persistantReducer.userReducer.user?.login}, gameMap: "map3" });
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

      const images = [
        {  url: Version1,  title: 'Play1',  width: '33.33%' },
        {  url: Version2,  title: 'Play2',  width: '33.33%' },
        {  url: Version3,  title: 'Play3',  width: '33.33%' },
      ];
      
      const ImageButton = styled(ButtonBase)(({ theme }) => ({
        position: 'relative', height: 200, [theme.breakpoints.down('sm')]: { width: '100% !important', // Overrides inline-style
          height: 100,
        },
        '&:hover, &.Mui-focusVisible': {zIndex: 1, '& .MuiImageBackdrop-root': { opacity: 0.15, },
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

    return (
        <React.Fragment>
            <Navbar />
            <Box paddingTop={"10%"} paddingBottom={"5%"}>
                <Typography align ="center" variant="h1" sx={{fontWeight:900}} >
                    <b style={{color:'black'}}>Jouez au Pong</b>
                </Typography>
                <Typography align ="center" variant={"body1"} pt={8}>
                    Choisissez votre version du jeu !!
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 100, width: '100%', }}>
                <ImageButton focusRipple key={images[0].title} style={{width: images[0].width}} onClick={startGame1}>
                    <ImageSrc style={{ backgroundImage: `url(${images[0].url})` }}/>
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,}}> 
                            {images[0].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
                <ImageButton focusRipple key={images[1].title} style={{width: images[1].width}} onClick={startGame2}>
                    <ImageSrc style={{ backgroundImage: `url(${images[1].url})` }}/>
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,}}> 
                            {images[1].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
                <ImageButton focusRipple key={images[2].title} style={{width: images[2].width}} onClick={startGame3}>
                    <ImageSrc style={{ backgroundImage: `url(${images[2].url})` }}/>
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                    <Image>
                        <Typography component="span" variant="subtitle1" color="white" sx={{position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,}}> 
                            {images[2].title} <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                    </Image>
                </ImageButton>
            </Box>
        </React.Fragment>
    )
}


export default MapSelector;

