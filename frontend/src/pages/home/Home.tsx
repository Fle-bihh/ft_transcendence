import React from 'react';
import { Box, Typography, Button } from "@mui/material"
import HomesImage from "../../styles/asset/gif_pong.gif"
import Navbar from '../../components/nav/Nav';
import { NavLink } from "react-router-dom";
import "./home.scss"
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)


// const titleRef = useRef()
const Home = (data: any) => {
  

  const slideInTop = (elem:any, delay:any) => {
    gsap.fromTo(
      elem,
      {
        y: -200,
        opacity: 0,

      },
      {
        opacity: 1,
        y: 10,
        delay: delay || 0,
        scrollTrigger: {
          trigger: elem,
          // start : "top center",
          // end: "bottom center",
        }
      }
    )
  }

  const onLoad = () => {
    gsap.timeline().fromTo(".letter",
      {
        x: -100,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        stagger: 0.33,
        delay: 0.7,
      }
    )
    .to(".letter", {
      margin:"0 15 vw",
      delay:0.8,
      duration:0.5,
    })
    .to(".letter", {
      margin:"0 0 vw",
      delay:0.8,
      duration:0.5,
    })
    // .to(".title", {
    //   x: -1000,
    //   delay:0.8,
    //   duration:0.5,
    // })
    .to(window, {
      duration:2,
      y:20,
      scrollTo: "#section"

    })
  }
  useEffect(() => {
    onLoad();

  }, [])

  useEffect(() => {
    slideInTop("#section", 0);

  }, [])


  return (
    <React.Fragment >
      <Navbar />

      {/* sx={{ */}
      {/* //   backgroundImage: `url(${HomesImage})`,
        //   backgroundRepeat: 'no-repeat',
        //   backgroundPosition: 'center',
        //   backgroundSize: 'cover',
        //   backgroundColor: 'black',
        //   display: 'flex',
        //   justifyContent: 'center',
        //   height: "120%",
        //   width: 'auto',
        // }}
      
    //    className="zoneText" */}


      
      <div className="fondText" >
        <h1 className="title" >
          <span className="letter">P</span>
          <span className="letter">O</span>
          <span className="letter">N</span>
          <span className="letter">G</span>
        </h1>
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
    </div>
      </div>
    </React.Fragment>
  );
};

export default Home;

