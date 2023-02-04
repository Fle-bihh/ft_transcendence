import Navbar from "../../components/nav/Nav";
import queryString from "query-string";
//import * as React from 'react';
import "./profileOther.scss";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Cerise from "../../styles/asset/cerise.jpg";
import Laurine from "../../styles/asset/ananas.png";
import * as React from "react";
import LoadingButton from '@mui/lab/LoadingButton';

import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import Version0 from "../../styles/asset/Version0.gif";
import Version1 from "../../styles/asset/Version1.gif";
import Version2 from "../../styles/asset/Version2.gif";
import Version3 from "../../styles/asset/Version3.gif";
import Version4 from "../../styles/asset/Version4.gif";
import Version5 from "../../styles/asset/Version5.gif";
import ButtonBase from '@mui/material/ButtonBase';

import Fab from "@mui/material/Fab";
import ModeEditIcon from "@mui/icons-material/ModeEdit";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import { userInfo } from "os";
import { useEffect, useState } from "react";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import axios from "axios";
import { PasswordRounded } from "@mui/icons-material";
import { Navigate, useNavigate } from "react-router-dom";
import { ip } from "../../App";
import Cookies from "universal-cookie";
import { utilsReducer } from "../../state/reducers/utilsReducer";
import Pong from "../pong/Pong";

const cookies = new Cookies();
const jwt = cookies.get("jwt");
const options = {
    headers: {
        authorization: `Bearer ${jwt}`,
    },
};

const NOT_FRIEND = 1;
const FRIEND_REQUEST_SEND = 2;
const FRIEND_REQUEST_WAITING = 3;
const FRIEND = 4;

const ProfileOther = () => {
    const [open, setOpen] = React.useState(false);
    const [gameopen, setGameOpen] = React.useState(false);
    const [friend, setFriend] = useState(NOT_FRIEND);
    const [inviteSend, setInviteSend] = useState(false);
    const [declineGame, setDeclineGame] = useState(false);
    const [roomId, setRoomId] = useState("");
    const [openGame, setOpenGame] = useState(false);
    const [matchHistory, setMatchHistory] = useState(
        Array<{
            id: number;
            user1_login: string;
            user2_login: string;
            user1_score: number;
            user2_score: number;
            winner_login: string;
        }>()
    );
    const utils = useSelector((state: RootState) => state.utils);
    const user = useSelector((state: RootState) => state.persistantReducer.userReducer);
    const [userDisplay, setUserDisplay] = useState({
        id: "",
        username: "", //pseudo
        login: "", // prenom  to --> login
        profileImage: "", // oui
        email: "",
        Rank: 0, // la XP de notre joueur
        WinNumber: 0, // nbr de gagne
        LossNumber: 0, // nbr de perdu
        twoFactorAuth: false,
        Friend: 0,
        getData: false,
        // http://localhost:3000/Profileother?username=ldauga
    });
    let userConnect = document.getElementById("userConnect");
    let userInGame = document.getElementById("userInGame");
    let userConnectHorsLigne = document.getElementById("userConnectHorsLigne");
    const navigate = useNavigate();
    
    utils.socket.removeListener("updateProfileOther");
    utils.socket.on(
        "updateProfileOther",
        (data: { login: string; friendStatus: string }) => {
            
            if (getComputedStyle(userInGame!).display == "flex") {
                userConnect!.style.display = "none"
                userInGame!.style.display = "none"
                userConnectHorsLigne!.style.display = "none"
                }
            console.log("oui");
            if (data.login != userDisplay.login) return;
            console.log("updateProfileOther", data.login, data.friendStatus);
            if (data.friendStatus == "request-send") {
                setFriend(FRIEND_REQUEST_SEND);
            }
            else if (data.friendStatus == "request-waiting") {
                setFriend(FRIEND_REQUEST_WAITING);
            }
            else if (data.friendStatus == "not-friend") {
                setFriend(NOT_FRIEND)
            }
            else {
                setFriend(FRIEND)
                if (getComputedStyle(userInGame!).display == "none") {
                    userInGame!.style.display = "flex"
                    userConnect!.style.display = "flex"

                    userConnectHorsLigne!.style.display = "flex"

                }
            };
        }
    );

    const getUserData = () => {
        // useEffect(() => {
        // if (userDisplay === null) {
        const parsed = queryString.parse(window.location.search);
        console.log("userDisplau", userDisplay);
        console.log("username moi", user.user?.username);
        console.log("parsed", parsed);

        // axios.get(`http://localhost:5001/user/login/${user.user?.parse.username}` Pas bon :)
        if (
            parsed.username == "" ||
            parsed.username == undefined ||
            parsed.username == user.user?.login
        ) {
            // axios.patch(`http://localhost:5001/user/${user.user?.id}/username`, { username: parsed.username }, options))
            console.log("COUCOU");
            window.location.replace(`http://${ip}:3000`);
        } else {
            //
            axios
                .get(`http://localhost:5001/user/login/${parsed.username} `, options)
                .then((response) => {
                    if (response.data.username != null) {
                        console.log("on est dedans");

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
                            Friend: response.data.Friend,
                            getData: true,
                        });
                        console.log("le display du gars :", userDisplay);
                        utils.socket.emit("GET_FRIEND_STATUS", {
                            login: response.data.login,
                        });
                    } else {
                        console.log("pas dans le if ");
                        window.location.replace(`http://${ip}:3000`);
                    }
                    // console.log(response);
                })
                .catch((error) => {
                    console.log(error);
                });
            // }
        }
        // })
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (change: boolean) => {
        if (change == true) {
            if (friend == NOT_FRIEND) {
                utils.socket.emit("SEND_FRIEND_REQUEST", {
                    loginToSend: userDisplay.login,
                });
            } else if (friend == FRIEND_REQUEST_SEND) {
                utils.socket.emit("DEL_FRIEND_REQUEST", {
                    loginToSend: userDisplay.login,
                });
            } else if (friend == FRIEND_REQUEST_WAITING) {
                utils.socket.emit("ACCEPT_FRIEND_REQUEST", {
                    loginToSend: userDisplay.login,
                });
            } else {
                utils.socket.emit("REMOVE_FRIEND_SHIP", {
                    loginToSend: userDisplay.login,
                });

            }
        }
        setOpen(false);
    };

    //invitation to game
    const handleGameOpen = () => {
        setGameOpen(true);
    };

    const handleGameClose = (change: boolean) => {
        setGameOpen(false);
        // setInviteSend(false);
    };

    function inviteGame1() {
        console.log("invite game front 1 to : ", userDisplay.username);
        utils.gameSocket.emit('INVITE_GAME', { sender: user.user?.username, gameMap: "map1", receiver: userDisplay.username });
        setInviteSend(true);
    }
    function inviteGame2() {
        console.log("invite game front 2");
        utils.gameSocket.emit('INVITE_GAME', { sender: user.user?.username, gameMap: "map2", receiver: userDisplay.username });
        setInviteSend(true);
    }
    function inviteGame3() {
        console.log("invite game front 3");
        utils.gameSocket.emit('INVITE_GAME', { sender: user.user?.username, gameMap: "map3", receiver: userDisplay.username });
        setInviteSend(true);
    }

    utils.gameSocket.removeListener("cant_invite");
    utils.gameSocket.on('cant_invite', (data: { sender: string, gameMap: string, receiver: string }) => {
        //cant invite this playeeeeeer
    })

    utils.gameSocket.removeListener("accept_game");
    utils.gameSocket.on('accept_game', (data: { sender: string, gameMap: string, receiver: string }) => {
        console.log("accept received");
        utils.gameSocket.emit('JOIN_ROOM', data.sender + data.receiver)
        utils.gameSocket.emit('START_INVITE_GAME', { user: { login: user.user?.username }, gameMap: data.gameMap });
        setRoomId(data.sender + data.receiver);
        setOpenGame(true);
        if (openGame && roomId != "")
            navigate('/Pong', { state:{ invite: true, roomId : roomId }})
    })

    utils.gameSocket.removeListener("decline_game");
    utils.gameSocket.on('decline_game', (data: { sender: string, gameMap: string, receiver: string }) => {
        console.log("decline received");
        setDeclineGame(true);
        setTimeout(function () {
            setGameOpen(false);
        }, 5000);
        setTimeout(function () {
            setDeclineGame(false);
            setInviteSend(false);
        }, 6000);
    })

    const images = [
        { url: Version0, title: 'Play Map 1', width: '33.33%' },
        { url: Version1, title: 'Play Map 2', width: '33.33%' },
        { url: Version2, title: 'Play Map 3', width: '33.33%' },
    ];

    const ImageButton = styled(ButtonBase)(({ theme }) => ({
        position: 'relative', height: 200, [theme.breakpoints.down('sm')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &.Mui-focusVisible': {
            zIndex: 1, '& .MuiImageBackdrop-root': { opacity: 0.15, },
            '& .MuiImageMarked-root': { opacity: 0, },
            '& .MuiTypography-root': { border: '4px solid currentColor', },
        },
    }));

    const ImageSrc = styled('span')({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundPosition: 'center 4%',
    });

    const Image = styled('span')(({ theme }) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
        border: '5px solid',
        borderColor: 'white',
    }));

    const ImageBackdrop = styled('span')(({ theme }) => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
        transition: theme.transitions.create('opacity'),
    }));

    const ImageMarked = styled('span')(({ theme }) => ({
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    }));

    //end Invitation to game

    useEffect(() => {
        console.log("effect : ", userDisplay);
        if (!userDisplay?.getData) {
            getUserData();
        }
    }, [userDisplay?.getData]);

    //----------------------------------------------------------------------------------------
    if (openGame && roomId != "") return (
        <Navigate to="/Pong" replace={true} state={{ invite:true, roomId:roomId }}/>
        // navigate('/Pong', { state:{ invite: true, roomId : roomId }})
    )
    return (
        <React.Fragment>
            <Navbar />

            <div className="profilePageContainerOther">
                <div className="profileOther">
                    <Stack direction="row" spacing={2} className="avatarItemOther">
                        <img
                            alt="Cerise"
                            src={userDisplay!.profileImage}
                            className="avatarOther"
                        />
                    </Stack>
                    <div id="userConnect" >
                        <div className="circleConnectLigne" id="userConnect"></div>

                        <div className="connect" id="userConnect">Online</div>
                    </div>
                    <div id="userInGame">
                        <div className="circleInGame" id="userInGame"></div>

                        <div className="connect" id="userInGame">In game</div>
                    </div>
                    <div id="userConnectHorsLigne">
                        <div className="circleConnectHorsLigne" id="userConnectHorsLigne"></div>
                        <div className="connect" id="userConnectHorsLigne">Not Connected</div>
                    </div>  
                    <div className="infoUserOther">
                        <h3 className="userNameOther">Login :</h3>
                        <Typography className="userNamePrintOther">
                            {userDisplay?.login}
                        </Typography>
                    </div>
                    <div className="infoUsernameOther">
                        <h3 className="userNameChangeOther">userName :</h3>
                        <Typography className="userNamePrintChangeOther">
                            {userDisplay?.username}
                        </Typography>
                    </div>
                    <Button
                        className="buttonChangeOther"
                        type="submit"
                        onClick={handleClickOpen}
                    >
                        {friend == NOT_FRIEND
                            ? "ADD FRIEND"
                            : friend == FRIEND_REQUEST_SEND
                                ? "FRIEND REQUEST SEND"
                                : friend == FRIEND_REQUEST_WAITING
                                    ? "FRIEND REQUEST WAITING"
                                    : "FRIEND"}

                    </Button>
                    <Dialog open={open} onClose={() => handleClose(false)}>
                        <DialogTitle>
                            {friend == NOT_FRIEND
                                ? `Send friend request to ${userDisplay.login} ?`
                                : friend == FRIEND_REQUEST_SEND
                                    ? `Cancel Request to ${userDisplay.login} ?`
                                    : friend == FRIEND_REQUEST_WAITING
                                        ? `Add ${userDisplay.login} to you friend list ?`
                                        : `Remove ${userDisplay.login} from your friends ?`}
                        </DialogTitle>
                        <DialogActions>
                            <Button onClick={() => handleClose(true)}>Confirm</Button>
                            <Button onClick={() => handleClose(false)}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                    {friend == FRIEND ?
                        <Button className="buttonChangeOther" onClick={handleGameOpen} >
                            Invite to game
                        </Button> :
                        <></>
                    }
                    <Dialog open={gameopen} onClose={() => handleGameClose(false)} fullWidth={true} maxWidth={"lg"}>
                        {!inviteSend ?
                            <><DialogTitle>
                                Choose the map you want to play :
                            </DialogTitle>
                            <DialogContentText>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 800, width: '100%' }}>
                                    <ImageButton focusRipple key={images[0].title} style={{ width: images[0].width }} onClick={inviteGame1}>
                                        <ImageSrc style={{ backgroundImage: `url(${images[0].url})` }} />
                                        <ImageBackdrop className="MuiImageBackdrop-root" />
                                        <Image>
                                            <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                                                {images[0].title} <ImageMarked className="MuiImageMarked-root" />
                                            </Typography>
                                        </Image>
                                    </ImageButton>
                                    <ImageButton focusRipple key={images[1].title} style={{ width: images[1].width }} onClick={inviteGame2}>
                                        <ImageSrc style={{ backgroundImage: `url(${images[1].url})` }} />
                                        <ImageBackdrop className="MuiImageBackdrop-root" />
                                        <Image>
                                            <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                                                {images[1].title} <ImageMarked className="MuiImageMarked-root" />
                                            </Typography>
                                        </Image>
                                    </ImageButton>
                                    <ImageButton focusRipple key={images[2].title} style={{ width: images[2].width }} onClick={inviteGame3}>
                                        <ImageSrc style={{ backgroundImage: `url(${images[2].url})` }} />
                                        <ImageBackdrop className="MuiImageBackdrop-root" />
                                        <Image>
                                            <Typography component="span" variant="subtitle1" color="white" sx={{ position: 'relative', p: 4, pt: 2, pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }}>
                                                {images[2].title} <ImageMarked className="MuiImageMarked-root" />
                                            </Typography>
                                        </Image>
                                    </ImageButton>
                                </Box>
                            </DialogContentText>
                            <DialogActions>
                                <Button onClick={() => handleGameClose(false)}>Cancel</Button>
                            </DialogActions></>
                            : !declineGame ?
                            <><DialogTitle>
                                Waiting for the player to accept
                            </DialogTitle>
                            <DialogContent sx={{ display: 'flex', flexDirection: 'column', m: 'auto', width: 'fit-content'}}>
                                <DialogContentText>
                                    <LoadingButton loading variant="outlined">
                                        <span>Submit</span>
                                    </LoadingButton>
                                </DialogContentText>
                            </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => handleGameClose(false)}>Close</Button>
                                </DialogActions></> 
                            : <><DialogTitle>
                                Decline
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Sorry {userDisplay.username} decline your invitation
                                </DialogContentText>
                                <DialogActions>
                                    <Button onClick={() => handleGameClose(false)}>Close</Button>
                                </DialogActions>
                            </DialogContent></> 
                        }
                    </Dialog>

                </div>

                <div className="statOther">
                    <div className="rectangleOther">
                        <div className="textRectangle">
                            <p>nbr Win</p>
                            {userDisplay?.WinNumber}
                        </div>
                        <div className="textRectangle">
                            <h2 style={{ color: "white" }}>Rank {userDisplay?.username}</h2>
                            {/* <h3 style={{ textAlign: 'center' }}>Number of parts</h3> */}
                            <h3
                                style={{
                                    textAlign: "center",
                                    fontWeight: "900",
                                    marginBottom: "3px",
                                }}
                            >
                                {userDisplay?.Rank}
                            </h3>
                        </div>
                        <div className="textRectangle">
                            <p>nbr Loose</p>
                            {userDisplay?.LossNumber}
                        </div>
                    </div>

                    {matchHistory.map((match) => {
                        return (
                            <div
                                className={
                                    match.winner_login == userDisplay?.username
                                        ? "itemWinnerOther"
                                        : "itemLoserOther"
                                }
                                key={match.id.toString()}
                            >
                                <div className="resultsOther">
                                    <div className="nameOther">{match.user1_login}</div>
                                    <div className="scoreOther">
                                        -{match.user1_score.toString()}-
                                    </div>
                                </div>

                                <div className="resultsOther">
                                    <Avatar
                                        alt="Cerise"
                                        src={Cerise}
                                        className="avatarStatuserOther"
                                        variant="square"
                                    />

                                    <Avatar
                                        alt="Laurine"
                                        src={Laurine}
                                        className="avatarStatuserOther"
                                        variant="square"
                                    />
                                </div>
                                <div className="resultsOther">
                                    <div className="scoreOther">
                                        -{match.user2_score.toString()}-
                                    </div>
                                    <div className="nameOther">{match.user2_login}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </React.Fragment>
    );
};
export default ProfileOther;
