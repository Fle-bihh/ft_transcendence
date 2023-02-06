import Navbar from "../../components/nav/Nav";
import queryString from "query-string";
//import * as React from 'react';
import "./profileOther.scss";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Cerise from "../../styles/asset/cerise.jpg";
import Laurine from "../../styles/asset/ananas.png";
import * as React from "react";
// import LoadingButton from "@mui/lab/LoadingButton";

import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../state";
import Version0 from "../../styles/asset/Version0.gif";
import Version1 from "../../styles/asset/Version1.gif";
import Version2 from "../../styles/asset/Version2.gif";
import { NotifType } from "../../state/type";
import Version5 from "../../styles/asset/Version5.gif";
import ButtonBase from "@mui/material/ButtonBase";
import Fab from "@mui/material/Fab";
import ModeEditIcon from "@mui/icons-material/ModeEdit";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  formLabelClasses,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { userInfo } from "os";
import { useEffect, useState } from "react";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import axios from "axios";
import { PasswordRounded } from "@mui/icons-material";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { ip } from "../../App";
import Cookies from "universal-cookie";
import { utilsReducer } from "../../state/reducers/utilsReducer";
import Pong from "../pong/Pong";
import { bindActionCreators } from "redux";

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
const BLOCKED = 5;

const ONLINE = 6;
const OFFLINE = 7;
const IN_GAME = 8;

const ProfileOther = () => {
  const [open, setOpen] = React.useState(false);
  const [gameopen, setGameOpen] = React.useState(false);
  const [friend, setFriend] = useState(NOT_FRIEND);
  const [clientStatus, setClientStatus] = useState(OFFLINE);
  const [inviteSend, setInviteSend] = useState(false);
  const [declineGame, setDeclineGame] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [openGame, setOpenGame] = useState(false);

  const [matchHistory, setMatchHistory] = useState(
    Array<{
      id: string;
      player1: string;
      score1: number;
      player2: string;
      score2: number;
      winner: string;
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
  let userConnect = document.getElementById("userConnect");
  let userInGame = document.getElementById("userInGame");
  let userConnectHorsLigne = document.getElementById("userConnectHorsLigne");
  const navigate = useNavigate();
  const { addNotif } = bindActionCreators(actionCreators, useDispatch());

  utils.socket.removeListener("updateProfileOther");
  utils.socket.on(
    "updateProfileOther",
    (data: { login: string; friendStatus: string }) => {
      // if (getComputedStyle(userInGame!).display == "flex") {
      //   userConnect!.style.display = "none";
      //   userInGame!.style.display = "none";
      //   userConnectHorsLigne!.style.display = "none";
      // }
      if (data.login != userDisplay.login) return;
      console.log("updateProfileOther", data.login, data.friendStatus);
      if (data.friendStatus == "blocked") {
        setFriend(BLOCKED);
      } else if (data.friendStatus == "request-send") {
        setFriend(FRIEND_REQUEST_SEND);
      } else if (data.friendStatus == "request-waiting") {
        // addNotif({
        //   type: NotifType.FRIENDREQUEST,
        //   data: {
        //     sender: data.login,
        //   },
        // });
        setFriend(FRIEND_REQUEST_WAITING);
      } else if (data.friendStatus == "not-friend") {
        setFriend(NOT_FRIEND);
      } else {
        setFriend(FRIEND);
        // if (getComputedStyle(userInGame!).display == "none") {
        //   userInGame!.style.display = "flex";
        //   userConnect!.style.display = "flex";

        //   userConnectHorsLigne!.style.display = "flex";
        // }
      }
    }
  );

  utils.gameSocket.removeListener("getClientStatus");
  utils.gameSocket.on(
    "getClientStatus",
    (data: { user: string; status: string }) => {
      // if (getComputedStyle(userInGame!).display == "flex") {
      //   userConnect!.style.display = "none";
      //   userInGame!.style.display = "none";
      //   userConnectHorsLigne!.style.display = "none";
      // }
      console.log("getClientStatus", data);
      if (data.user != userDisplay.login) return;


      if (data.status == 'online')
        setClientStatus(ONLINE)
        else if (data.status == 'offline')
        setClientStatus(OFFLINE)
        else if (data.status == 'in-game')
        setClientStatus(IN_GAME)
      // if (getComputedStyle(userInGame!).display == "none") {
      //   userInGame!.style.display = "flex";
      //   userConnect!.style.display = "flex";

      //   userConnectHorsLigne!.style.display = "flex";
      // }
    }
  );

  const getUserData = () => {
    const parsed = queryString.parse(window.location.search);
    console.log("userDisplau", userDisplay);
    console.log("username moi", user.user?.username);
    console.log("parsed", parsed);

    if (
      parsed.username == "" ||
      parsed.username == undefined ||
      parsed.username == user.user?.login
    ) {
      {
        console.log("je suis avant le if");
        window.history.pushState({}, window.location.toString());
        window.location.replace("/");
      }
    } else {
      axios
        .get(`http://localhost:5001/user/username/${parsed.username} `, options)
        .then((response) => {
          if (response.data.username != null) {
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
            utils.socket.emit("GET_FRIEND_STATUS", {
              login: response.data.login,
            });
            utils.gameSocket.emit("GET_CLIENT_STATUS", {
              nickname: response.data.username,
            });
            axios
              .get(`http://localhost:5001/game/${user.user?.id}`, options)
              .then((response) => {
                if (response.data != null) {
                  response.data.map((data: any) => {
                    const obj = {
                      id: data.game.id,
                      player1: data.game.player1.username,
                      score1: data.game.score_u1,
                      player2: data.game.player2.username,
                      score2: data.game.score_u2,
                      winner: data.game.winner.username,
                    };
                    matchHistory.push(obj);
                  });
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.log("je suis dans le get");

          window.history.pushState({}, window.location.toString());
          window.location.replace("/");
        });
    }
  };
  //   user.suer?.id /blocked/, {username : },  option
  //  axios.patch(`http://localhost:5001/user/${user.user?.id}/blocked`, { username: userDisplay.username }, options).then(response => {
  //     if (response.data != null) {

  //         console.log("on est bloque", response.data)
  //     }
  // }).catch(err => {
  //     if (err.response!.status === 500) {

  //         console.log("on est pas bloque", err.response.data)

  //     }
  // })

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (change: boolean) => {
    if (change == true) {
      console.log("send to : ", userDisplay.login);
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

  const handleGameOpen = () => {
    setGameOpen(true);
  };

  const handleGameClose = (change: boolean) => {
    setGameOpen(false);
  };

  function inviteGame1() {
    console.log("invite game front 1 to : ", userDisplay.username);
    utils.gameSocket.emit("INVITE_GAME", {
      sender: user.user?.username,
      gameMap: "map1",
      receiver: userDisplay.username,
    });
    setInviteSend(true);
  }
  function inviteGame2() {
    console.log("invite game front 2");
    utils.gameSocket.emit("INVITE_GAME", {
      sender: user.user?.username,
      gameMap: "map2",
      receiver: userDisplay.username,
    });
    setInviteSend(true);
  }
  function inviteGame3() {
    console.log("invite game front 3");
    utils.gameSocket.emit("INVITE_GAME", {
      sender: user.user?.username,
      gameMap: "map3",
      receiver: userDisplay.username,
    });
    setInviteSend(true);
  }

  utils.gameSocket.removeListener("accept_game");
  utils.gameSocket.on(
    "accept_game",
    (data: { sender: string; gameMap: string; receiver: string }) => {
      console.log("accept received");
      utils.gameSocket.emit("JOIN_ROOM", data.sender + data.receiver);
      utils.gameSocket.emit("START_INVITE_GAME", {
        user: { login: user.user?.username },
        gameMap: data.gameMap,
      });
      setRoomId(data.sender + data.receiver);
      setOpenGame(true);
      if (openGame && roomId != "")
        navigate("/Pong", { state: { invite: true, roomId: roomId } });
    }
  );

  utils.gameSocket.removeListener("decline_game");
  utils.gameSocket.on(
    "decline_game",
    (data: { sender: string; gameMap: string; receiver: string }) => {
      console.log("decline received");
      setDeclineGame(true);
      setTimeout(function () {
        setGameOpen(false);
      }, 5000);
      setTimeout(function () {
        setDeclineGame(false);
        setInviteSend(false);
      }, 6000);
    }
  );

  const images = [
    { url: Version0, title: "Play Map 1", width: "33.33%" },
    { url: Version1, title: "Play Map 2", width: "33.33%" },
    { url: Version2, title: "Play Map 3", width: "33.33%" },
  ];

  const ImageButton = styled(ButtonBase)(({ theme }) => ({
    position: "relative",
    height: 200,
    [theme.breakpoints.down("sm")]: {
      width: "100% !important", // Overrides inline-style
      height: 100,
    },
    "&:hover, &.Mui-focusVisible": {
      zIndex: 1,
      "& .MuiImageBackdrop-root": { opacity: 0.15 },
      "& .MuiImageMarked-root": { opacity: 0 },
      "& .MuiTypography-root": { border: "4px solid currentColor" },
    },
  }));

  const ImageSrc = styled("span")({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundPosition: "center 4%",
  });

  const Image = styled("span")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
    border: "5px solid",
    borderColor: "white",
  }));

  const ImageBackdrop = styled("span")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  }));

  const ImageMarked = styled("span")(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  }));
  //end Invitation to game

  useEffect(() => {
    console.log("effect : ", userDisplay);
    if (!userDisplay?.getData) {
      getUserData();
    }
  }, [userDisplay?.getData]);

  if (openGame && roomId != "")
    return (
      <Navigate
        to="/Pong"
        replace={true}
        state={{ invite: true, roomId: roomId }}
      />
    );
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
          {friend == FRIEND ? (
            <>
              {clientStatus == ONLINE ? (
                <div id="userConnect">
                  <div className="circleConnectLigne" id="userConnect"></div>

                  <div className="connect" id="userConnect">
                    Online
                  </div>
                </div>
              ) : clientStatus == IN_GAME ? (
                <div id="userInGame">
                  <div className="circleInGame" id="userInGame"></div>

                  <div className="connect" id="userInGame">
                    In game
                  </div>
                </div>
              ) : clientStatus == OFFLINE ? (
                <div id="userConnectHorsLigne">
                  <div
                    className="circleConnectHorsLigne"
                    id="userConnectHorsLigne"
                  ></div>
                  <div className="connect" id="userConnectHorsLigne">
                    Not Connected
                  </div>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
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
          {friend == FRIEND ? (
            <Button className="buttonChangeOther" onClick={handleGameOpen}>
              Invite to game
            </Button>
          ) : (
            <></>
          )}
          <Dialog
            open={gameopen}
            onClose={() => handleGameClose(false)}
            fullWidth={true}
            maxWidth={"lg"}
          >
            {!inviteSend ? (
              <>
                <DialogTitle>Choose the map you want to play :</DialogTitle>
                <DialogContentText>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      minWidth: 800,
                      width: "100%",
                    }}
                  >
                    <ImageButton
                      focusRipple
                      key={images[0].title}
                      style={{ width: images[0].width }}
                      onClick={inviteGame1}
                    >
                      <ImageSrc
                        style={{ backgroundImage: `url(${images[0].url})` }}
                      />
                      <ImageBackdrop className="MuiImageBackdrop-root" />
                      <Image>
                        <Typography
                          component="span"
                          variant="subtitle1"
                          color="white"
                          sx={{
                            position: "relative",
                            p: 4,
                            pt: 2,
                            pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                          }}
                        >
                          {images[0].title}{" "}
                          <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                      </Image>
                    </ImageButton>
                    <ImageButton
                      focusRipple
                      key={images[1].title}
                      style={{ width: images[1].width }}
                      onClick={inviteGame2}
                    >
                      <ImageSrc
                        style={{ backgroundImage: `url(${images[1].url})` }}
                      />
                      <ImageBackdrop className="MuiImageBackdrop-root" />
                      <Image>
                        <Typography
                          component="span"
                          variant="subtitle1"
                          color="white"
                          sx={{
                            position: "relative",
                            p: 4,
                            pt: 2,
                            pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                          }}
                        >
                          {images[1].title}{" "}
                          <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                      </Image>
                    </ImageButton>
                    <ImageButton
                      focusRipple
                      key={images[2].title}
                      style={{ width: images[2].width }}
                      onClick={inviteGame3}
                    >
                      <ImageSrc
                        style={{ backgroundImage: `url(${images[2].url})` }}
                      />
                      <ImageBackdrop className="MuiImageBackdrop-root" />
                      <Image>
                        <Typography
                          component="span"
                          variant="subtitle1"
                          color="white"
                          sx={{
                            position: "relative",
                            p: 4,
                            pt: 2,
                            pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                          }}
                        >
                          {images[2].title}{" "}
                          <ImageMarked className="MuiImageMarked-root" />
                        </Typography>
                      </Image>
                    </ImageButton>
                  </Box>
                </DialogContentText>
                <DialogActions>
                  <Button onClick={() => handleGameClose(false)}>Cancel</Button>
                </DialogActions>
              </>
            ) : !declineGame ? (
              <>
                <DialogTitle>Waiting for the player to accept</DialogTitle>
                <DialogContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    m: "auto",
                    width: "fit-content",
                  }}
                >
                  <DialogContentText>
                    <button>
                      <span>Submit</span>
                    </button>
                    {/* <LoadingButton loading variant="outlined">
                    </LoadingButton> */}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => handleGameClose(false)}>Close</Button>
                </DialogActions>
              </>
            ) : (
              <>
                <DialogTitle>Decline</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Sorry {userDisplay.username} decline your invitation
                  </DialogContentText>
                  <DialogActions>
                    <Button onClick={() => handleGameClose(false)}>
                      Close
                    </Button>
                  </DialogActions>
                </DialogContent>
              </>
            )}
          </Dialog>
        </div>
        <div className="statOther">
          <div className="rectangleOther">
            <div className="textRectangle">
              <p>nbr Win</p>
              {userDisplay?.WinNumber}
            </div>
            <div className="textRectangle">
              <h2 style={{ color: "black" }}>Rank</h2>
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
                  match.winner == userDisplay?.username
                    ? "itemWinnerOther"
                    : "itemLoserOther"
                }
                key={match.id.toString()}
              >
                <div className="resultsOther">
                  <div className="nameOther">
                    {match.player1 == userDisplay?.username
                      ? match.player1
                      : match.player2}
                  </div>
                  <div className="scoreOther">
                    -
                    {match.player1 == userDisplay?.username
                      ? match.score1
                      : match.score2}
                    -
                  </div>
                </div>
                <div className="resultsOther">
                  <div className="scoreOther">
                    -
                    {match.player2 == userDisplay?.username
                      ? match.score1
                      : match.score2}
                    -
                  </div>
                  <div className="nameOther">
                    {match.player2 == userDisplay?.username
                      ? match.player1
                      : match.player2}
                  </div>
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
