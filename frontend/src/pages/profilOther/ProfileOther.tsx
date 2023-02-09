import Navbar from "../../components/nav/Nav";
import queryString from "query-string";
import "./profileOther.scss";
import Box from "@mui/material/Box";
import * as React from "react";

import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../state";
import { bindActionCreators } from "redux";
import Version0 from "../../styles/asset/Version0.gif";
import Version1 from "../../styles/asset/Version1.gif";
import Version2 from "../../styles/asset/Version2.gif";
import ButtonBase from "@mui/material/ButtonBase";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

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
  const [gameOpenDialog, setGameOpenDialog] = useState(false);
  const [friend, setFriend] = useState(NOT_FRIEND);
  const [clientStatus, setClientStatus] = useState(OFFLINE);
  const [inviteSend, setInviteSend] = useState(false);
  const [declineGame, setDeclineGame] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomSpectate, setRoomSpectate] = useState("");
  const [spectate, setSpectate] = useState(false);
  const [openGame, setOpenGame] = useState(false);
  const dispatch = useDispatch();
  const { removeNotifInvite } = bindActionCreators(actionCreators, dispatch);
  const navigate = useNavigate();
  const [matchHistory] = useState(
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
  });

  utils.socket.removeListener("updateProfileOther");
  utils.socket.on(
    "updateProfileOther",
    (data: { username: string; friendStatus: string }) => {
      console.log(
        "updateProfileOther received with",
        data.username,
        data.friendStatus,
        "usrname = ",
        userDisplay.username
      );
      if (data.username !== userDisplay.username) return;
      if (data.friendStatus === "blocked") {
        setFriend(BLOCKED);
      } else if (data.friendStatus === "request-send") {
        setFriend(FRIEND_REQUEST_SEND);
      } else if (data.friendStatus === "request-waiting") {
        setFriend(FRIEND_REQUEST_WAITING);
      } else if (data.friendStatus === "not-friend") {
        setFriend(NOT_FRIEND);
      } else {
        setFriend(FRIEND);
      }
    }
  );
  utils.gameSocket.removeListener("getClientStatus");
  utils.gameSocket.on(
    "getClientStatus",
    (data: { user: string; status: string; emitFrom: string }) => {
      console.log("getClientStatus", data, userDisplay);
      if (data.user !== userDisplay.login) return;
      if (data.status === "online") setClientStatus(ONLINE);
      else if (data.status === "offline") setClientStatus(OFFLINE);
      else if (data.status === "in-game") setClientStatus(IN_GAME);
    }
  );

  const getUserData = () => {
    const parsed = queryString.parse(window.location.search);
    console.log("parsed = ", parsed);
    if (
      parsed.username === "" ||
      parsed.username === undefined ||
      parsed.username === user.user?.username
    ) {
      window.history.pushState({}, window.location.toString());
      window.location.replace("/");
    } else {
      axios
        .get(
          `http://${utils.ip}:5001/user/username/${parsed.username} `,
          options
        )
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
              username: response.data.username,
            });
            utils.gameSocket.emit("GET_CLIENT_STATUS", {
              login: response.data.login,
            });
          }
        })
        .catch((error) => {
          window.history.pushState({}, window.location.toString());
          window.location.replace("/*");
        });
    }
    axios
      .get(`http://${utils.ip}:5001/game/${user.user?.id}`, options)
      .then((response) => {
        if (response.data != null) {
          matchHistory.splice(0, matchHistory.length);
          response.data.forEach((data: any) => {
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
  };
  // console.log('histo', userDisplay.WinNumber, userDisplay.LossNumber)

  const handleClickOpen = () => {
    if (friend !== BLOCKED) setOpen(true);
  };

  const handleClose = (change: boolean) => {
    if (change === true) {
      console.log("send ", friend, "to : back with ", userDisplay.login);
      if (friend === NOT_FRIEND) {
        utils.socket.emit("SEND_FRIEND_REQUEST", {
          sender: user.user?.username,
          receiver: userDisplay.username,
        });
      } else if (friend === FRIEND_REQUEST_SEND) {
        utils.socket.emit("DEL_FRIEND_REQUEST", {
          receiver: userDisplay.username,
        });
      } else if (friend === FRIEND_REQUEST_WAITING) {
        utils.socket.emit("ACCEPT_FRIEND_REQUEST", {
          receiver: userDisplay.username,
        });
      } else {
        utils.socket.emit("REMOVE_FRIEND_SHIP", {
          receiver: userDisplay.username,
        });
        removeNotifInvite(user.user!.username);
      }
    }
    setOpen(false);
  };

  //invite Game
  const handleGameOpen = () => {
    setGameOpenDialog(true);
  };

  const handleGameClose = (change: boolean) => {
    setGameOpenDialog(false);
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
        roomId: data.sender + data.receiver,
      });
      setRoomId(data.sender + data.receiver);
      setOpenGame(true);
      // if (openGame && roomId !== "")
      //   navigate("/Pong", { state: { invite: true, roomId: roomId } });
    }
  );

  utils.gameSocket.removeListener("decline_game");
  utils.gameSocket.on(
    "decline_game",
    (data: { sender: string; gameMap: string; receiver: string }) => {
      console.log("decline received");
      setDeclineGame(true);
      setTimeout(function () {
        setGameOpenDialog(false);
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
    if (!userDisplay?.getData) {
      getUserData();
    }
  });

  utils.gameSocket.removeListener("getRoomId");
  utils.gameSocket.on("getRoomId", (roomId: string) => {
    setRoomSpectate(roomId);
    setSpectate(true);
  });

  if (openGame && roomId !== "")
    return (
      <Navigate
        to="/Pong"
        replace={true}
        state={{ invite: true, roomId: roomId }}
      />
    );
  else if (spectate === true && roomSpectate != "")
    return (
      <Navigate
        to="/Pong"
        replace={true}
        state={{ spectate: true, roomId: roomSpectate }}
      />
    );
  else
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
            {friend === FRIEND ? (
              <>
                {clientStatus === ONLINE ? (
                  <div id="userConnect">
                    <div className="circleConnectLigne" id="userConnect"></div>

                    <div className="connect" id="userConnect">
                      Online
                    </div>
                  </div>
                ) : clientStatus === IN_GAME ? (
                  <div id="userInGame">
                    <div className="circleInGame" id="userInGame"></div>

                    <div className="connect" id="userInGame">
                      In game
                    </div>
                  </div>
                ) : clientStatus === OFFLINE ? (
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
              {friend === NOT_FRIEND
                ? "ADD FRIEND"
                : friend === FRIEND_REQUEST_SEND
                ? "FRIEND REQUEST SEND"
                : friend === BLOCKED
                ? "BLOCKED"
                : friend === FRIEND_REQUEST_WAITING
                ? "FRIEND REQUEST WAITING"
                : "FRIEND"}
            </Button>
            <Dialog open={open} onClose={() => handleClose(false)}>
              <DialogTitle>
                {friend === NOT_FRIEND
                  ? `Send friend request to ${userDisplay.login} ?`
                  : friend === FRIEND_REQUEST_SEND
                  ? `Cancel Request to ${userDisplay.login} ?`
                  : friend === FRIEND_REQUEST_WAITING
                  ? `Add ${userDisplay.login} to you friend list ?`
                  : `Remove ${userDisplay.login} from your friends ?`}
              </DialogTitle>
              <DialogActions>
                <Button onClick={() => handleClose(true)}>Confirm</Button>
                <Button onClick={() => handleClose(false)}>Cancel</Button>
              </DialogActions>
            </Dialog>
            {friend === FRIEND ? (
              <Button className="buttonChangeOther" onClick={handleGameOpen}>
                Invite to game
              </Button>
            ) : (
              <></>
            )}
            <Dialog
              open={gameOpenDialog}
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
                    <Button onClick={() => handleGameClose(false)}>
                      Cancel
                    </Button>
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
                  ></DialogContent>
                  <DialogActions>
                    <Button onClick={() => handleGameClose(false)}>
                      Close
                    </Button>
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
            {clientStatus === IN_GAME ? (
              <Button
                className="buttonChangeOther"
                onClick={() => {
                  utils.gameSocket.emit("GET_ROOM_ID", {
                    userToSee: userDisplay.username,
                  });
                }}
              >
                Watch his game
              </Button>
            ) : (
              <></>
            )}
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
                    match.winner === userDisplay?.username
                      ? "itemWinnerOther"
                      : "itemLoserOther"
                  }
                  key={match.id.toString()}
                >
                  <div className="resultsOther">
                    <div className="nameOther">
                      {match.player1 === userDisplay?.username
                        ? match.player1
                        : match.player2}
                    </div>
                    <div className="scoreOther">
                      -
                      {match.player1 === userDisplay?.username
                        ? match.score1
                        : match.score2}
                      -
                    </div>
                  </div>
                  <div className="resultsOther">
                    <div className="scoreOther">
                      -
                      {match.player2 === userDisplay?.username
                        ? match.score1
                        : match.score2}
                      -
                    </div>
                    <div className="nameOther">
                      {match.player2 === userDisplay?.username
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
