import {
  Avatar,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { Component, useEffect } from "react";

import LockSharpIcon from "@mui/icons-material/LockSharp";
import Link from "@mui/material/Link";
import { NavLink } from "react-router-dom";
import "./signin.scss";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../state";
import axios from "axios";
import { ip } from '../../App';

// import Checkbox from '@mui/material/Checkbox';
// const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

// const Login =({handleChange})=>{
const Signin = () => {
  const paperStyle = { padding: 20, height: 500, width: 300, margin: "0 auto" };
  const utils = useSelector((state: RootState) => state.utils);
  const avatarStyle = { backgroundColor: "red", margin: "20px auto" };
  // const textStyle={textAlign:'center'}
  const btnStyle = { margin: "8px 0" };
  const formStyle = { lineHeight: "4" };
  const askStyle = { lineHeight: "2" };

  const [inputUsernameValue, setInputUsernameValue] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  const submitForm = () => {
    console.log("submit form Signin")
    console.log('inputvalue = ', inputUsernameValue)
    console.log('pass = ', password)
    axios.get(`http://${ip}:5001/user/login/${inputUsernameValue}`).then(response => {
      console.log('data = ', response.data);
      if (response.data != null) {
        console.log("EMIIIIIT")
        utils.socket.emit("ADD_USER", { login: inputUsernameValue });
        setUser(response.data);
        window.location.replace(`http://localhost:3000/`);
      }
      else
      {
        console.log("NUUUUUUULLLLLLLL")
      }
    }).catch(error => {
      console.log("error catch : ")
      console.log(error);
    })
    // utils.socket.emit("ADD_USER", { login: inputUsernameValue });
    // if ()
    // window.location.replace(`http://${ip}:3000/`);
  }

  return (
    <Grid>
      <Paper style={paperStyle}>
        <Grid>
          <Avatar style={avatarStyle}>
            <LockSharpIcon />
          </Avatar>
          <h2>Sign In</h2>
        </Grid>
        <form style={formStyle} onSubmit={submitForm}>
          <TextField
            label="Login"
            variant="standard"
            placeholder="Enter login"
            fullWidth
            required
            value={inputUsernameValue}
            onChange={(value) =>
              setInputUsernameValue(value.currentTarget.value)
            }
          />
          <TextField
            label="Password"
            variant="standard"
            placeholder="Enter password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(value) =>
              setPassword(value.currentTarget.value)
            }
          />

          {/* <FormControlLabel control={<Checkbox />} label="Remember me" /> */}
          {/* <NavLink to="/"> */}
          <Button type="submit" color="primary"
            variant="contained"
            style={btnStyle}
            fullWidth > Sign in
          </Button>
          {/* </NavLink> */}
          <Typography style={askStyle}>
            <Link href="#">Forgot password ?</Link>
          </Typography>
          <Typography>
            {" "}
            Do you have an account ?
            {/* <Link href='/singup' onClick={()=>handleChange("event",1)}> */}
            <NavLink to="/signup">Sign up</NavLink>
          </Typography>
        </form>
      </Paper>
    </Grid>
  );
};

export default Signin;
