import Version1 from "../../styles/asset/gif_pong.gif";
import Version2 from "../../styles/asset/Version2.gif";
import Version3 from "../../styles/asset/Version3.gif";
import {NavLink} from "react-router-dom";


import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Navbar from "../nav/Nav"

const images = [
  {
    url: Version1,
    title: 'Play1',
    width: '33.33%',
    
  },
  {
    url: Version2,
    title: 'Play2',
    width: '33.33%',
   
  },
  {
    url: Version3,
    // url: '/static/images/buttons/camera.jpg',
    title: 'Play3',
    width: '33.33%',
  
   
  },
];

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 200,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
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
  // padding: '10px 12px',
  
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

export default function ButtonBases() {
  return (
    <React.Fragment>
        <Navbar />

    <Box>
    <Typography align ="center" variant="h1" sx={{fontWeight:900}} >
                  <b style={{color:'black'}}>Versions</b>
    </Typography>
    <Typography align ="center" variant={"body1"} pt={8}>
                 Choisissez votre version du jeu !!
             </Typography>
    </Box>

    <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 100, width: '100%', }}>
      {images.map((image) => (
        <ImageButton
          focusRipple
          key={image.title}
          style={{
            width: image.width,
          }}
        >
         
          <ImageSrc style={{ backgroundImage: `url(${image.url})` }}/>


          <ImageBackdrop className="MuiImageBackdrop-root" />
          <Image>
          <NavLink to='/pong' >
            <Typography
              component="span"
              variant="subtitle1"
              color="white"
              sx={{
                position: 'relative',
                p: 4,
                pt: 2,
                pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
              }}
            >
              {image.title}

              <ImageMarked className="MuiImageMarked-root" />
            </Typography>
      </NavLink>

          </Image>
        </ImageButton>
      ))}
    </Box>
          </React.Fragment>
  );
}