import Navbar from "../../components/nav/Nav";
import queryString from "query-string";
//import * as React from 'react';
import "./profileOther.scss";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Cerise from "../../styles/asset/cerise.jpg";
import Laurine from "../../styles/asset/ananas.png";
import * as React from "react";

import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSelector } from "react-redux";
import { RootState } from "../../state";

import Fab from "@mui/material/Fab";
import ModeEditIcon from "@mui/icons-material/ModeEdit";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { userInfo } from "os";
import { useEffect, useState } from "react";
import axios from "axios";
import { PasswordRounded } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { ip } from "../../App";
import Cookies from "universal-cookie";
import { utilsReducer } from "../../state/reducers/utilsReducer";

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

    const [friend, setFriend] = useState(NOT_FRIEND);

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
    const user = useSelector(
        (state: RootState) => state.persistantReducer.userReducer
    );

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

    utils.socket.removeListener("updateProfileOther");
    utils.socket.on(
        "updateProfileOther",
        (data: { login: string; friendStatus: string }) => {
            console.log("oui");
            if (data.login != userDisplay.login) return;
            console.log("updateProfileOther", data.login, data.friendStatus);

            if (data.friendStatus == "request-send") setFriend(FRIEND_REQUEST_SEND);
            else if (data.friendStatus == "request-waiting")
                setFriend(FRIEND_REQUEST_WAITING);
            else if (data.friendStatus == "not-friend") setFriend(NOT_FRIEND);
            else setFriend(FRIEND);
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

    useEffect(() => {
        console.log("effect : ", userDisplay);
        if (!userDisplay?.getData) {
            getUserData();
        }
    }, [userDisplay?.getData]);

    //-----------------------------------------------------------------------
    function userConnect() {
        console.log("SALUT2");
        return (
            <div className="userConnect">
                <div className="circleConnectLigne"></div>

                <div className="connect">Online</div>
            </div>
        );
    }

    function userInGame() {
        return (
            <div className="userInGame">
                <div className="circleInGame"></div>

                <div className="connect">In game</div>
            </div>
        );
    }

    function userConnectHorsLigne() {
        return (
            <div className="userConnectHorsLigne">
                <div className="circleConnectHorsLigne"></div>
                <div className="connect">Not Connected</div>
            </div>
        );
    }

    function connect() {
        // const isLoggedIn = props.isLoggedIn;
        if (userDisplay.Friend == 1) {
            console.log("SALUT1");
            return userConnect();
        } else if (userDisplay.Friend == 0) {
            return userInGame();
        } else if (userDisplay.Friend == 0) {
            return userConnectHorsLigne();
        }
    }

    //----------------------------------------------------------------------------------------
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
                    {/* <div className={userDisplay.Friend == 1 ? {connect()} : ""}>
                    </div> */}
                    {/* <div className="userConnect">
                        <div className="circleConnectLigne"></div>

                        <div className="connect">Online</div>
                    </div>

                    <div className="userInGame">
                        <div className="circleInGame"></div>

                        <div className="connect">In game</div>
                    </div>

                    <div className="userConnectHorsLigne">
                        <div className="circleConnectHorsLigne"></div>
                        <div className="connect">Not Connected</div>
                    </div> */}
                    {/* </div> */}
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

                    {/* { setMatchHistory([...matchHistory, { id: matchHistory.length, user1_login: userDisplay!.username, user2_login: 'wWWWWWWWW', user1_score: 1, user2_score: 3, winner_login: 'Cerise' }]) } */}
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
