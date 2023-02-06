import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import React, { Component, SyntheticEvent, useEffect, useState } from "react";

import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { NavLink } from "react-router-dom";
import axios from "axios";
import FlashMessage from "../../components/alert-message/Alert";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { ip } from "../../App";
import { RootState } from "../../state";
import { useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { setUser } from "../../state/action-creators";

// const url = 'http://${ip}:3000/signup'
const cookies = new Cookies();
const jwt = cookies.get('jwt');
const options = {
  headers: {
    Authorization: `Bearer ${jwt}`
  }
}
console.log('Signup cookie == ', options);

const Signup = () => {
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const paperStyle = { padding: 20, height: 500, width: 300, margin: "0 auto" };
  const avatarStyle = { backgroundColor: "red", margin: "10px auto" };
  // const textStyle={textAlign:'center'}
  const btnStyle = { margin: "10px 90px" }; //placer le bouton
  const formStyle = { lineHeight: "4" }; //espace entre les lignes
  const styleSignin = { marginLeft: 103 };

  const [userName, setuserName] = useState(""); // nous permet de mttre userName a vide
  const [lastName, setlastName] = useState("");
  const [firstName, setfirstName] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [succes, setsucces] = useState(false);
  const [error, seterror] = useState(false);
  const [message, setmessage] = useState("");
  const [message2, setmessage2] = useState("");

  useEffect(() => {
    setUser(null);
  }, [])

  const HandleCountAdding = (e: React.ChangeEvent<any>) => {
    const count = { userName, lastName, firstName, password };
    e.preventDefault();

    axios
      .post(`http://${ip}:5001/users/signup`, {
        userName: userName,
        lastName: lastName,
        firstName: firstName,
        password: password,
      })
      .then((response) => {
        setmessage("Welcome " + userName);
        setsucces(true);
        // Handle data
      })
      .catch((error) => {
        if (error.response!.status === 400) {
          setmessage2(error.response.status + " veuillez remplir correctement");
          // setmessage2(error.request);

          seterror(true);
        } else {
          setmessage2(error.response.status + " user existe deja");
          seterror(true);
        }
      });
    setsucces(false);
    seterror(false);
    // pour que quand on écrit de la merde ca recharge pas quand on valide avce le bouton
  };

  return (

    <button
      className="i42-button"
      onClick={() =>
        window.open(
          `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fhome&response_type=code`,
          "_self"
        )
      }
    >
      <img
        className="i42-logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/langfr-280px-42_Logo.svg.png"
        alt=""
      />
    </button>
  );
};

export default Signup;
