import Navbar from '../../components/nav/Nav';
import queryString from 'query-string';
//import * as React from 'react';
import "./profileOther.scss"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Cerise from '../../styles/asset/cerise.jpg'
import Laurine from '../../styles/asset/ananas.png'
import * as React from 'react';


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
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PasswordRounded } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { ip } from '../../App';

const ProfileOther = () => {

    const [matchHistory, setMatchHistory] = useState(Array<{
        id: number,
        user1_login: string,
        user2_login: string,
        user1_score: number,
        user2_score: number,
        winner_login: string,
    }>())

    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector(
        (state: RootState) => state.persistantReducer.userReducer
    );

    const [userDisplay, setUserDisplay] = useState<{
        id: string,
        username: string, //pseudo
        password: string, // pas besoin 
        firstName: string, // prenom  to --> login 
        lastName: string, // pas besoin 
        nickName: string, //degage 
        profileImage: string, // oui 
        email: string, // non
        isLogged: boolean, // pas besoin 
        isAdmin: boolean, // pas besoin
        GoalTaken: number, // pas besoin
        GoalSet: number, // pas besoin 
        NormalGameNumber: number, // pas besoin
        RankedGameNumber: number, // pas besoin
        NormalWinNumber: number, // to -> win 
        // perdu

        RankedWinNumber: number, // pas besoin
        PP: number, // pas besoin --> XP
        twoFactorAuth: boolean, // pas besoin
        Security: boolean, // pas besoin
        Friend: number, // ouiiiii 
        Climber: boolean, // pas besoin
        Hater: number, // pas besoin
        // http://localhost:3000/Profileother?username=ldauga

    } | null>(null);

    // useEffect(() => {
    //     if (userDisplay == null) {
    //         const parsed = queryString.parse(window.location.search);
    //         console.log(parsed)
    //         if (parsed.username == '' || parsed.username == undefined) {
    //             window.location.replace("http://${ip}:3000/")
    //         }
    //         else { //
    //             axios.get(`http://${ip}:5001/user/login/${parsed.username}`).then(response => {
    //                 if (response.data != null) {
    //                     setUserDisplay(response.data);
    //                 }
    //                 console.log(response);
    //             })
    //         }
    //     }
    // })


    return (
        <React.Fragment >

            <Navbar />

            <div className="profilePageContainerOther">

                <div className="profileOther" >

                    <Stack direction="row" spacing={2} className="avatarItemOther">
                        <img alt="Cerise" src={userDisplay!.profileImage} className="avatarOther" />
                    </Stack>

                    <div className="userConnect">

                        <div className="circleConnectLigne"></div>

                        <div className="connect">
                            Online
                        </div>

                    </div>
                    <div className="userConnectHorsLigne">

                        <div className="circleConnectHorsLigne">

                        </div>

                        <div className="connect">
                            Not Connected
                        </div>
                    </div>


                    <div className="infoUserOther">
                        <h3 className="userNameOther">
                            Login :
                            </h3>
                        <Typography className="userNamePrintOther">
                            {userDisplay?.username}
                        </Typography>

                    </div>
                    <div className="infoUsernameOther">

                        <h3 className="userNameChangeOther">
                            userName :
                            </h3>
                        <Typography className="userNamePrintChangeOther">
                            {userDisplay?.username}
                        </Typography>

                    </div>
                    <Button className="buttonChangeOther" type="submit" onClick={() => { setMatchHistory([...matchHistory, { id: matchHistory.length, user1_login: userDisplay!.username, user2_login: 'wWWWWWWWW', user1_score: 1, user2_score: 3, winner_login: 'Cerise' }]) }}>
                        Change UserName
                        </Button>
                </div>



                <div className="statOther">

                    <Box className="rectangleOther">
                        <h2 style={{ color: 'white' }}>Game History {userDisplay?.username}</h2>
                        <h3 style={{ textAlign: 'center' }}>Number of parts</h3>
                        <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '3px' }}>{matchHistory.length}</h3>

                    </Box>

                    {matchHistory.map((match) => {
                        return (
                            <div className={match.winner_login == userDisplay?.username ? 'itemWinnerOther' : 'itemLoserOther'} key={match.id.toString()}  >

                                <div className="resultsOther" >
                                    <div className="nameOther">{match.user1_login}</div>
                                    <div className="scoreOther">-{match.user1_score.toString()}-</div>

                                </div>

                                <div className="resultsOther" >

                                    <Avatar alt="Cerise" src={Cerise}
                                        className="avatarStatuserOther" variant="square" />

                                    <Avatar alt="Laurine" src={Laurine}
                                        className="avatarStatuserOther" variant="square" />
                                </div>
                                <div className="resultsOther">
                                    <div className="scoreOther">-{match.user2_score.toString()}-</div>
                                    <div className="nameOther">{match.user2_login}</div>
                                </div>


                            </div>
                        )
                    })}
                </div>
            </div>
            </React.Fragment >


    )
};
export default ProfileOther;
