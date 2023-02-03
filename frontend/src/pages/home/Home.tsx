import React from 'react';
import { Button } from "@mui/material"
import Navbar from '../../components/nav/Nav';
import { NavLink } from "react-router-dom";
import "./home.scss"

const Home = (data: any) => {
  
  return (
    <React.Fragment >
      <Navbar />
        <div className="fondText" >

        <section className="zoneText" id="section">

          <h1 >
            <b style={{ color: 'black', border: 'solid', borderWidth: 'thick', borderSpacing: "2" }}>Pong</b>
          </h1>
          <h2  >
            Règles :
            </h2>
          <div className="rules" >
            Utilisez les commandes pour déplacer la raquette vers le haut ou le bas de manière à renvoyer la balle à votre adversaire, en l'empêchant de passer.
            Celui qui remporte le match est bien entendu celui qui marque le plus de points.
            </div>
          <NavLink to='/pong' className="btnPlay"  >
            <Button className="btn2">
              Jouer
                </Button>
          </NavLink>
        </section>
    {/* </div> */}
      </div>
    </React.Fragment>
  );
};

export default Home;

