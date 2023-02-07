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
            Rules:
            </h2>
          <div className="rules" >

            Use the up and down arrows on the keyboard to move the racket and return the ball to your opponent, preventing him from passing.
            Whoever wins the match is the one who scores 3 points.
            </div>
          <NavLink to='/pong' className="btnPlay"  >
            <Button className="btn2">
              Play
                </Button>
          </NavLink>
        </section>
        {/* </div> */}
      </div>
    </React.Fragment>
  );
};

export default Home;

