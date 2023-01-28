// import * as React from 'react';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemText from '@mui/material/ListItemText';
// import ListSubheader from '@mui/material/ListSubheader';
import { GameClass } from './gameClass';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import { Box, ListItemButton, ListItemIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

export default function WatchingListGame(props: {
    all_rooms: Array<GameClass>
    setRoomID: any
    setSpectator: any
}) {

    const ImageButton = styled(ButtonBase)(({ theme }) => ({
        position: 'relative', height: "50%", [theme.breakpoints.down('sm')]: {
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

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '50%', overflowX: "scroll"}}>
            {props.all_rooms.map((room) => (
                    <ImageButton focusRipple key={room.roomID} style={{ width: "100%" }}>
                        <ImageSrc style={{ background:"black" }} />
                        <ImageBackdrop className="MuiImageBackdrop-root" />
                        <Image>
                            <Typography component="span" variant="subtitle1" color="inherit" sx={{ position: 'relative',p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                                {room.players[0].username} VS {room.players[1].username}<ImageMarked className="MuiImageMarked-root" />
                            </Typography>
                        </Image>
                    </ImageButton>
            ))}
        </Box>
    );
}