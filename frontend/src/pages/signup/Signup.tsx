import {
  Avatar,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import React, { useState } from "react";

import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { NavLink } from "react-router-dom";
const url = "http://localhost:3000/signup";

const Signup = () => {
  const paperStyle = { padding: 20, height: 500, width: 300, margin: "0 auto" };
  const avatarStyle = { backgroundColor: "red", margin: "10px auto" };
  // const textStyle={textAlign:'center'}
  const btnStyle = { margin: "10px 90px" }; //placer le bouton
  const formStyle = { lineHeight: "4" }; //espace entre les lignes
  const styleSignin = { marginLeft: 103 };

  const [username, setUsername] = useState(""); // nous permet de mttre userName a vide
  const [login, setLogin] = useState("");
  const [password, setpassword] = useState("");

  const HandleCountAdding = async (e: React.ChangeEvent<any>) => {
    const count = { username, login, password };
    e.preventDefault();

    fetch("http://localhost:3000/signup", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(count),
    }).then(() => {
      console.log(count);
    });

    // try {
    //     const resp = await axios.post(url, {userName,lastName, firstName,email,password });
    //     console.log(resp.data)
    // } catch (error) {
    //     console.log(error)

    // }
    // pour que quand on écrit de la merde ca recharge pas quand on valide avce le bouton
  };

  return (
    <Grid>
      <Paper style={paperStyle}>
        <Grid>
          <Avatar style={avatarStyle}>
            <AddCircleOutlineIcon />
          </Avatar>
          <h2>Sign Up</h2>
          <Typography align="center" variant={"body2"} lineHeight="3">
            Please fill this form to create an account
          </Typography>
        </Grid>
        <form onSubmit={HandleCountAdding} style={formStyle}>
          <Box className="align">
            <TextField
              type="text"
              variant="standard"
              label="Login"
              placeholder="Enter Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            <TextField
              type="text"
              variant="standard"
              label="Username"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>
          <TextField
            variant="standard"
            fullWidth
            label="Password"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
          />

          <TextField
            variant="standard"
            fullWidth
            label="Confirm Password"
            type="password"
            placeholder="Enter Password"
          />
          <Button type="submit" variant="contained" color="primary">
            Sign Up
          </Button>
          <NavLink to="/signin" style={styleSignin}>
            Sign in
          </NavLink>
        </form>
      </Paper>
    </Grid>
  );
};

export default Signup;
