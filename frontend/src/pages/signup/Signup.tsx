import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import React, { Component, SyntheticEvent, useState } from 'react';

import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import FlashMessage from '../../components/alert-message/Alert'
import { Avatar, Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';



// const url = 'http://localhost:3000/signup'

const Signup = () => {

    const paperStyle={padding:20, height:500, width:300, margin:'0 auto'}
    const avatarStyle={backgroundColor: 'red', margin:'10px auto'}
    // const textStyle={textAlign:'center'}
    const btnStyle={margin:'10px 90px'}//placer le bouton
    const formStyle={lineHeight: '4'}//espace entre les lignes
    const styleSignin={marginLeft: 103}

    const [userName, setuserName] = useState (''); // nous permet de mttre userName a vide
    const [lastName, setlastName] = useState ('');
    const [firstName, setfirstName] = useState ('');
    const [email, setemail] = useState ('');
    const [password, setpassword] = useState ('');
    const [succes, setsucces] = useState (false);
    const [error, seterror] = useState (false);
    const [message, setmessage] = useState ('');
    const [message2, setmessage2] = useState ('');


    // const [error, seterror] = useState ('');
    // const [openError, setopenError] = useState ('');

    // const redirectTo42 = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:5001/auth/42');
    //         window.location.href = response.data.url;
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    const HandleCountAdding =  (e: React.ChangeEvent<any>) => {
        const count = {userName, lastName, firstName, password}
        e.preventDefault();


        axios.post('http://localhost:5001/users/signup', {
            userName: userName,
            lastName: lastName,
            firstName: firstName,
            password: password,
        })
        .then((response) => {
            console.log('cocoucoucouc');
            // console.log(response.data);
            setmessage("Welcome " + userName);
            setsucces(true);
            // Handle data
        })
        .catch((error) => {
            if (error.response!.status === 400) {
                setmessage2(error.response.status + ' veuillez remplir correctement');
                // setmessage2(error.request);

                seterror(true)
             
            } else {
                setmessage2(error.response.status + ' user existe deja');
                seterror(true)
              
            }
            
            // setmessage2(error.response.status)
            //  seterror(true)
            //  console.log(JSON.stringify(error))
            // console.log("PROBLEME")
            // console.log(error.response.status);
        })
            setsucces(false)
            seterror(false)

        // showError = (err: any) => {

        //     const error = err.response && err.response.data || err.message;
        //     this.setState({error, openError: true});
        //                 };

        // this.showError
             // pour que quand on écrit de la merde ca recharge pas quand on valide avce le bouton
    };

    return (
            <React.Fragment >
        <Grid >
            <Paper   style={paperStyle}>
                <Grid >
                    <Avatar style={avatarStyle}>
                        <AddCircleOutlineIcon />
                    </Avatar>
                    <h2 >Sign Up</h2>
                    <Typography align ="center" variant={"body2"}  lineHeight='3'>
                        Please fill this form to create an account
                    </Typography>
                </Grid>
                    <form  onSubmit={HandleCountAdding} style={formStyle}>


                    <FormControl variant="standard"  style={btnStyle}>
                    <InputLabel htmlFor="input-with-icon-adornment">
                        Pseudo
                    </InputLabel>
                        <Input
                        type="text"
                        id="input-with-icon-adornment"
                            startAdornment={
                                <InputAdornment position="start">
                                    <AccountCircle />
                                    </InputAdornment>
                                        }
                                        value={userName}
                            onChange={(e)=>setuserName(e.target.value)}//nous permet de mettre userName à la valeur rentré, on appelle la fonction setuserName
                                />
                        </FormControl>


                    <Box className='align' >
                    <TextField
                        type="text"
                        variant="standard"
                        label='Last Name'
                        placeholder='Enter Name'
                        value={lastName}
                        onChange={(e)=>setlastName(e.target.value)}
                    />
                        <TextField
                            type="text"
                            variant="standard"
                            label='First Name'
                            placeholder='Enter Firstname'
                            value={firstName}
                            onChange={(e)=>setfirstName(e.target.value)}
                        />
                        </Box>

                    <TextField
                        type="text"
                        variant="standard"
                        fullWidth label='Email'
                        placeholder='Enter Email'
                        value={email}
                        onChange={(e)=>setemail(e.target.value)}
                    />
                    <TextField
                        variant="standard"
                        fullWidth label='Password'
                        type='password'
                        placeholder='Enter Password'
                        value={password}
                        onChange={(e)=>setpassword(e.target.value)}/>

                    <TextField variant="standard" fullWidth label=' Confirm Password' type='password' placeholder='Enter Password'/>
                    <Button type='submit' variant='contained' color='primary'  >Sign Up</Button>
                    <NavLink to='/signin' style={styleSignin}>
                        Sign in
                    </NavLink>
                    </form>
        <button className="i42-button" onClick={() => window.open(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fhome&response_type=code`, '_self')}>
            <img className="i42-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/langfr-280px-42_Logo.svg.png" alt="" />
            Connect with ouiiiiiiiiiii
        </button>
                    </Paper>
            </Grid>
            {
                succes ?  <FlashMessage 
                message={message} /> : ''
            }
            {
                error ? <FlashMessage message2={message2} /> : ''
            }


            {/* {
                error ? <FlashMessage message={message} /> : ''

            }  */}
{/* 
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity="error">
                  COUCOU
             </Alert>
             </Stack> */}

    </React.Fragment>
     );
 };

export default Signup;


