
import Navbar from '../../components/nav/Nav';
import * as React from 'react';
import "./profil.scss"
// import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';


// import { Avatar, Button, Checkbox, FormControlLabel,TextField, Typography } from '@mui/material';
// const Item = styled(Paper)(({ theme }) => ({
//     backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//     ...theme.typography.body2,
//     padding: theme.spacing(1),
//     textAlign: 'center',
//     color: theme.palette.text.secondary,
//   }));


const Profile = () => {
 const paperStyle={padding:20, height:500, width:300, backgroundColor: 'red', margin:100}
const paperStyleState={padding:20, height:500, width:700, backgroundColor: 'blue', margin:100}

    return (
      <React.Fragment >

        <Navbar />

    <Box sx={{ width: '70%' }}>
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid xs={6}>
            <Paper style={paperStyle} >
            1
            test 123
            </Paper>
        </Grid>
        <Grid xs={6}>
            <Paper style={paperStyleState}>
            2
            test 123
            </Paper>
        </Grid>
    </Grid>
    </Box>
    </React.Fragment >
    
    ) 
};
export default Profile;