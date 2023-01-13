
import React from 'react';
import {Box, Typography} from "@mui/material"
import HomesImage from "../../styles/asset/gif_pong.gif"
import Versions from "../../components/versions/Versions";
import Navbar from '../../components/nav/Nav';
import "./home.scss"

  const Home = (data: any) => {

    return (
      <React.Fragment >
        <Navbar />
        <Box 
        sx={{
          backgroundImage:`url(${HomesImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition:'center',
          backgroundSize: 'cover',
          backgroundColor: 'black',
          display:'flex',
          justifyContent:'center',
          height: 750,
          width:'100%',

          
        }}
        >
          <Box sx={{width: {xs:"100%", sm:"50%", md:"40%"}, padding: {xs:3, sm:2, md:20}}}>
            <Box sx={{background:"white", opacity:"0.8"}}>
    
              <Typography align ="center" variant="h1" sx={{fontWeight:900}} >
                  <b style={{color:'black'}}>Pong</b>
              </Typography>
          
            <Typography align ="center" variant={"h2"} pt={8}>
                 Règles :
             </Typography>
            <Typography align ="center" variant={"body1"} pt={8}>
                 Utilisez les commandes pour déplacer la raquette vers le haut ou le bas de manière à renvoyer la balle à votre adversaire, en l'empêchant de passer. 
                 Celui qui remporte le match est bien entendu celui qui marque le plus de points.
             </Typography>
            </Box>
          </Box>

        </Box>
          <Versions />
      </React.Fragment>
    );
 };

 export default Home;

