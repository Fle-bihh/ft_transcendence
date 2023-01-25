
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
import { useEffect, useState } from 'react';

import Fab from '@mui/material/Fab'; import
ModeEditIcon from '@mui/icons-material/ModeEdit';

import { Button, Dialog, DialogContent, DialogTitle, Input, TextField, Typography } from '@mui/material';
import { userInfo } from 'os';
import axios from 'axios';


// rajouter bouton activer A2FA ou non 




// rajouter bouton activer A2FA ou non 

const Profile = () => {

    const [matchHistory, setMatchHistory] = React.useState(Array<{
        id: number,
        user1_login: string,
        user2_login: string, // class user
        user1_score: number,
        user2_score: number,
        winner_login: string,
    }>())

    const [firstOpen, setFirstOpen] = useState(true)
    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector(
        (state: RootState) => state.persistantReducer.userReducer
    );

    const [inputValue, setInputValue] = useState("")

    const [userDisplay, setUserDisplay] = useState<{

        id: string,
        username: string, //pseudo
        login: string, // prenom  to --> login 
        profileImage: string, // oui
        email: string,
        Rank: number, // la XP de notre joueur 
        WinNumber: number, // nbr de gagne
        LossNumber: number,// nbr de perdu
        twoFactorAuth: boolean,

    } | null>(null);


    const [userMatchHistory, setUserMatchHistory] = useState(
        Array<{
            login: string,
            scoreLogin: number,
            login2: string,
            scoreLogin2: number,
            matchWin: string, // login de la personne qui a gagné
        }>()
    );

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    useEffect(() => {
        if (firstOpen) {
            axios.get(`http://localhost:5001/user/login/${user.user?.username}`).then(response => {

                if (response.data = ! null) {
                    setUserDisplay({
                        id: response.data.id,
                        username: response.data.username,
                        login: response.data.login,
                        profileImage: response.data.profileImage,
                        email: response.data.email,
                        WinNumber: response.data.WinNumber,
                        LossNumber: response.data.LossNumber,
                        Rank: response.data.Rank,
                        twoFactorAuth: response.data.twoFactorAuth,

                    })
                    console.log("response data =", response.data)
                    setFirstOpen(false)
                }
            }).catch(error => {
                console.log(error);
            });
        }
    }, [firstOpen]
    )



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
                            {userDisplay?.username}
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

                    {/* setMatchHistory([...matchHistory, { id: matchHistory.length, user1_login: user.user!.username, user2_login: 'wWWWWWWWW', user1_score: 1, user2_score: 3, winner_login: 'Cerise' }]) */}

                    <Button className="buttonChange" type="submit" onClick={handleClickOpen}>
                        Change UserName
                    </Button>
                    <Dialog
                        // fullScreen={fullScreen}
                        open={open}
                        onClose={handleClose}
                    >
                        <div>
                            Write your new username
                        </div>
                        <div>
                            <input
                                placeholder="Enter new username"
                                value={inputValue}
                                onChange={(event) => setInputValue(event.currentTarget.value)}
                            >
                            </input>
                            {/* <div onClick={
                                axios.put('/api/article/123', {
                                    title: 'Making PUT Requests with Axios',
                                    status: 'published',
                                }),
                                handleClose
                            }>
                                Validé
                            </div> */}

                        </div>
                    </Dialog>

                </div>
                {/* </Grid>
                    <Grid xs={6}> */}
                <div className="stat">

                    <div className="rectangle">
                        <div className="textRectangle">
                            <p>nbr Win</p>
                            <p>9</p>
                        </div>
                        <div className="textRectangle">
                            <h2 style={{ color: 'white' }}>Scoring {user.user?.username}</h2>
                            {/* <h3 style={{ textAlign: 'center' }}>Number of parts</h3> */}
                            <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '3px' }}>{matchHistory.length}</h3>
                        </div>
                        <div className="textRectangle">
                            <p>nbr Loose</p>
                            <p>2</p>
                        </div>
                    </div>

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