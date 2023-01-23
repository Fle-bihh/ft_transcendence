
import Navbar from '../../components/nav/Nav';
import * as React from 'react';
import "./profil.scss"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Cerise from '../../styles/asset/cerise.jpg'
import Laurine from '../../styles/asset/ananas.png'


import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useSelector } from 'react-redux';
import { RootState } from '../../state';

import Fab from '@mui/material/Fab'; import
ModeEditIcon from '@mui/icons-material/ModeEdit';

import { Button, Typography } from '@mui/material';
import { userInfo } from 'os';

const Profile = () => {

    const [matchHistory, setMatchHistory] = React.useState(Array<{
        id: number,
        user1_login: string,
        user2_login: string,
        user1_score: number,
        user2_score: number,
        winner_login: string,
    }>())

    //  const paperStyle={padding:20, height:500, width:300, backgroundColor: 'red', margin:100}
    // const paperStyleState={padding:20, height:500, width:700, backgroundColor: 'blue', margin:100}
    // const StyledBadge = styled(Badge)(({ theme }) => ({
    //     '& .MuiBadge-badge': {
    //         backgroundColor: '#44b700',
    //         color: '#44b700',
    //         boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    //         '&::after': {
    //             position: 'absolute',
    //             top: 0,
    //             left: 0,
    //             width: '100%',
    //             height: '100%',
    //             borderRadius: '0%',
    //             animation: 'ripple 1.2s infinite ease-in-out',
    //             border: '1px solid currentColor',
    //             content: '""',
    //         },
    //     },
    //     '@keyframes ripple': {
    //         '0%': {
    //             transform: 'scale(.8)',
    //             opacity: 1,
    //         },
    //         '100%': {
    //             transform: 'scale(2.4)',
    //             opacity: 0,
    //         },
    //     },
    // }));
    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector(
        (state: RootState) => state.persistantReducer.userReducer
    );
    //  const Item = classNames="Item"

    return (
        <React.Fragment >
            {/* <div className="navSpace"></div> */}
            <Navbar />

            <div className="profilePageContainer">
                {/* <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} > */}
                {/* <Grid xs={6} > */}
                <div className="profile" >

                    <Stack direction="row" spacing={2} className="avatarItem">
                        {/* <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            className="avatarItem"
                        > */}
                        <img alt="Cerise" src={Cerise} className="avatar" />
                    </Stack>
                    <Button className="avatarChange" type="submit">
                        Change Profile Picture
                        </Button>

                    <div className="infoUser">
                        <h3 className="userName">
                            Login :
                            </h3>
                        <Typography className="userNamePrint">
                            {user.user?.username}
                        </Typography>

                    </div>
                    <div className="infoUsername">

                        <h3 className="userNameChange">
                            userName :
                            </h3>
                        <Typography className="userNamePrintChange">
                            {user.user?.username}
                        </Typography>

                    </div>
                    <Button className="buttonChange" type="submit" onClick={() => { setMatchHistory([...matchHistory, { id: matchHistory.length, user1_login: user.user!.username, user2_login: 'wWWWWWWWW', user1_score: 1, user2_score: 3, winner_login: 'Cerise' }]) }}>
                        Change UserName
                        </Button>





                </div>
                {/* </Grid>
                    <Grid xs={6}> */}
                <div className="stat">

                    <Box className="rectangle">
                        <h2 style={{ color: 'white' }}>Game History {user.user?.username}</h2>
                        <h3 style={{ textAlign: 'center' }}>Number of parts</h3>
                        <h3 style={{ textAlign: 'center', fontWeight: '900' , marginBottom: '3px'}}>{matchHistory.length}</h3>

                    </Box>

                    {matchHistory.map((match) => {
                        return (
                            <div className={match.winner_login == user.user!.username ? 'itemWinner' : 'itemLoser'} key={match.id.toString()}  >

                                <div className="results" >
                                    <div className="name">{match.user1_login}</div>
                                    <div className="score">-{match.user1_score.toString()}-</div>

                                </div>

                                <div className="results" >

                                    <Avatar alt="Cerise" src={Cerise}
                                        className="avatarStatuser" variant="square" />

                                    <Avatar alt="Laurine" src={Laurine}
                                        className="avatarStatuser" variant="square" />
                                </div>
                                <div className="results">
                                    <div className="score">-{match.user2_score.toString()}-</div>
                                    <div className="name">{match.user2_login}</div>
                                </div>


                            </div>
                        )
                    })}
                    {/* spacing={5} */}


                </div>
            </div>
        </React.Fragment >

    )
};
export default Profile;