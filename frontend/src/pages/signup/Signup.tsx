import { Avatar, Grid, Paper, Typography, TextField, Button, Box} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import React, { useState } from 'react';

import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { NavLink } from 'react-router-dom';
const url = 'http://172.16.1.10:3000/signup'

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
        
        const HandleCountAdding =  async (e: React.ChangeEvent<any>) => {
            const count = {userName, lastName, firstName, email, password}
            e.preventDefault();
            

         fetch('http://172.16.1.10:3000/signup',
           { 
            method: 'POST', 
            mode: 'cors', 
            body: JSON.stringify(count)
            }
            ).then(() => {
                console.log(count)
            })

            // try {
            //     const resp = await axios.post(url, {userName,lastName, firstName,email,password });
            //     console.log(resp.data)
            // } catch (error) {
            //     console.log(error)

            // }
    // pour que quand on écrit de la merde ca recharge pas quand on valide avce le bouton
        };

    return (
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

          </Paper>
      </Grid>
    );
};

export default Signup; 
