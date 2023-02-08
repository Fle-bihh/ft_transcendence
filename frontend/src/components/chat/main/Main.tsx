//
import "./Main.scss";
import { RootState } from "../../../state";
import ChannelSettingsDialog from "../channelSettingsDialog/ChannelSettingsDialog";

//
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";
import Person2Icon from "@mui/icons-material/Person2";
import { useSelector } from "react-redux";
import FlashMessage from '../../alert-message/Alert'
import { Navigate, NavLink } from "react-router-dom";
import Version0 from "../../../styles/asset/Version0.gif";
import Version1 from "../../../styles/asset/Version1.gif";
import Version2 from "../../../styles/asset/Version2.gif";

const Main = (props: {
  openConvName: string;
  setOpenConvName: Function;
  allConv: Array<{
    receiver: string;
    last_message_text: string;
    last_message_time: Date;
    new_conv: boolean;
  }>;
  setAllConv: Function;
  newConvMessageBool: boolean;
  setNewConvMessageBool: Function;
  allChannels: Array<{
    index: number;
    privacy: boolean;
    name: string;
    description: string;
    owner: string;
    password: boolean;
  }>;
  setAllChannels: Function;
}) => {
  const [convMessages, setConvMessages] = useState(
    Array<{
      id: number;
      sender: string;
      receiver: string;
      content: string;
      time: Date;
      serverMsg: boolean;
    }>()
  );
  const [inputValue, setInputValue] = useState("");
  const [topInputValue, setTopInputValue] = useState("");
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [message, setmessage] = useState("");
  const [succes, setsucces] = useState(false);
  const [gameOpenDialog, setGameOpenDialog] = useState(false);
  const [inviteSend, setInviteSend] = useState(false);
  const [declineGame, setDeclineGame] = useState(false);
  const [openGame, setOpenGame] = useState(false);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    utils.socket.emit("GET_CONV", {
      sender: user.user?.username,
      receiver: props.openConvName,
    });
    console.log("send GET_CONV to back");
  }, [props.openConvName, props.allConv,user.user?.username, utils.socket]);

  useEffect(() => {
    let tmp = document.getElementById("messagesDisplay");
    if (tmp != null) {
      tmp.scrollTop = tmp.scrollHeight;
    }
  }, [convMessages]);

  utils.socket.removeListener("get_conv");
  utils.socket.on(
    "get_conv",
    (
      openConv: Array<{
        id: number;
        sender: string;
        receiver: string;
        content: string;
        time: Date;
        serverMsg: boolean;
      }>
    ) => {
      console.log("get_conv recu front", openConv);
      const sorted = openConv.sort((a, b) => a.id - b.id);
      setConvMessages(sorted);
    }
  );

  utils.socket.removeListener("check_user_exist");
  utils.socket.on("check_user_exist", (exist: boolean) => {
    if (exist) {
      const tmpArray = [...props.allConv];
      tmpArray.shift();
      tmpArray.unshift({
        receiver: topInputValue,
        last_message_text: "",
        last_message_time: new Date(),
        new_conv: false,
      });
      props.setAllConv(tmpArray);
      props.setOpenConvName(topInputValue);
      props.setNewConvMessageBool(false);
      setTopInputValue("");
    } else {
      setTopInputValue("");
      alert("User not found...");
    }
  });

  utils.socket.removeListener("get_all_channels");
  utils.socket.on(
    "get_all_channels",
    (
      data: Array<{
        index: number;
        privacy: boolean;
        name: string;
        description: string;
        owner: string;
        password: boolean;
      }>
    ) => {
      console.log("get_all_channels recu", user.user?.username);
      props.setAllChannels([...data]);
    }
  );

  //invite Game
  const handleGameOpen = () => {
    setGameOpenDialog(true);
  };

  const handleGameClose = (change: boolean) => {
    setGameOpenDialog(false);
  };

  function inviteGame1(username : string) {
    console.log("invite game front 1 to : ", username);
    utils.gameSocket.emit("INVITE_GAME", { sender: user.user?.username, gameMap: "map1", receiver: username,});
    setInviteSend(true);
  }
  function inviteGame2(username : string) {
    console.log("invite game front 2");
    utils.gameSocket.emit("INVITE_GAME", { sender: user.user?.username, gameMap: "map2", receiver: username,});
    setInviteSend(true);
  }
  function inviteGame3(username : string) {
    console.log("invite game front 3");
    utils.gameSocket.emit("INVITE_GAME", { sender: user.user?.username, gameMap: "map3", receiver: username,});
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
      // if (openGame && roomId != "")
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
  //end invite Game

  if (openGame && roomId !== "")
    return ( <Navigate to="/Pong" replace={true} state={{ invite: true, roomId: roomId }} />);
  return (
    <div className="main">
      {props.newConvMessageBool ? (
        <div className="mainTitleContainer">
          <div className="mainTitle">To :</div>
          <input
            className="newConvMessageInput"
            type="text"
            id="outlined-basic"
            placeholder=""
            value={topInputValue}
            autoComplete={"off"}
            onChange={(event) => {
              setTopInputValue(event.currentTarget.value);
            }}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                utils.socket.emit("CHECK_USER_EXIST", {username: topInputValue});
              }
            }}
          ></input>
        </div>
      ) : (
        <div className="mainTitleContainer">
          <div className="mainTitle">To :</div>
          <div>{props.openConvName}</div>
          <div className="buttons">
            {props.allChannels.find(
              (channel) => channel.name === props.openConvName
            ) ? (
              <IconButton
                className="settingButton"
                color="secondary"
                style={{ color: "white", marginRight: "2%" }}
                aria-label="upload picture"
                component="label"
                onClick={() => setSettingsDialogOpen(true)}
              >
                {/* <input hidden accept="image/*" type="file" /> */}
                <SettingsIcon />
              </IconButton>
            ) : (
              <div className="messageButtons">
                <NavLink to={`/profileother?username=${props.openConvName}`}>
                  <IconButton
                    className="profileButton"
                    color="secondary"
                    style={{ color: "white", marginRight: "2%" }}
                    aria-label="upload picture"
                    component="label"
                  >
                    {/* <input hidden accept="image/*" type="file" /> */}
                    <Person2Icon />
                  </IconButton>
                </NavLink>
                <IconButton className="startGameButton" color="secondary" style={{ color: "white", marginRight: "2%" }} aria-label="upload picture" component="label"
                  onClick={handleGameOpen}>
                  <SportsEsportsIcon />
                </IconButton>
                <Dialog open={gameOpenDialog} onClose={() => handleGameClose(false)} fullWidth={true} maxWidth={"lg"} >
                  {!inviteSend ? (
                    <>
                      <DialogTitle>Choose the map you want to play :</DialogTitle>
                      <DialogContentText>
                        <Box sx={{ display: "flex", flexWrap: "wrap", minWidth: 800, width: "100%", }}>
                          <ImageButton focusRipple key={images[0].title} style={{ width: images[0].width }} onClick={() => inviteGame1(props.openConvName)} >
                            <ImageSrc style={{ backgroundImage: `url(${images[0].url})` }}/>
                            <ImageBackdrop className="MuiImageBackdrop-root" />
                            <Image>
                              <Typography component="span" variant="subtitle1" color="white" sx={{   position: "relative",   p: 4,   pt: 2,   pb: (theme) => `calc(${theme.spacing(1)} + 6px)`, }} >
                                {images[0].title}{" "}
                                <ImageMarked className="MuiImageMarked-root" />
                              </Typography>
                            </Image>
                          </ImageButton>
                          <ImageButton focusRipple key={images[1].title} style={{ width: images[1].width }} onClick={() => inviteGame2(props.openConvName)}>
                            <ImageSrc style={{ backgroundImage: `url(${images[1].url})` }}/>
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
                          <ImageButton focusRipple key={images[2].title} style={{ width: images[2].width }} onClick={() => inviteGame3(props.openConvName)} >
                            <ImageSrc style={{ backgroundImage: `url(${images[2].url})` }} />
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
                          Sorry {props.openConvName} decline your invitation
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
                <IconButton
                  className="blockButton"
                  color="secondary"
                  style={{ color: "white", marginRight: "2%" }}
                  aria-label="upload picture"
                  component="label"
                  onClick={() => {
                    setmessage("You blocked this user")
                    setsucces(true)
                    utils.socket.emit("BLOCK_USER", {
                      username: user.user?.username,
                      target: props.openConvName,
                    });
                    console.log(
                      "send BLOCK_USER to back from",
                      user.user?.username
                    );
                  }}
                >
                  {/* <input hidden accept="image/*" type="file" /> */}
                  <BlockIcon />
                </IconButton>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="messagesContainer">
        {!props.newConvMessageBool ? (
          <div className="messagesDisplay" id="messagesDisplay">
            {convMessages.map((message, index) => {
              if (message.serverMsg)
                return (
                  <div
                    key={index.toString()}
                    className="serverMessagesContainer"
                  >
                    <div className="diviser" />
                    {message.content}
                    <div className="diviser" />
                  </div>
                );
              else if (message.sender === user.user?.username)
                return (
                  <div key={index.toString()} className="rightMessages">
                    {message.content}
                  </div>
                );
              else
                return (
                  <div key={index.toString()} className="leftMessages">
                    <div className="messageSender">
                      {message.sender + " : "}
                    </div>
                    <div className="messageContent">{message.content}</div>
                  </div>
                );
            })}
            {/* <!-- messages go here --> */}
            {/* <Messages messages={messages} onClick={() => setMobile(false)} loading={loading} /> */}
          </div>
        ) : (
          <div></div>
        )}
        {!props.newConvMessageBool ? (
          <div className="messageInput">
            {/* <!-- input field goes here --> */}
            <input
              type="text"
              id="outlined-basic"
              placeholder="NeyMessage"
              value={inputValue}
              autoComplete={"off"}
              onChange={(event) => {
                setInputValue(event.currentTarget.value);
              }}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  utils.socket.emit("ADD_MESSAGE", {
                    sender: user.user?.username,
                    receiver: props.openConvName,
                    content: inputValue,
                  });
                  console.log("send ADD_MESSAGE to back");
                  setInputValue("");
                }
              }}
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <ChannelSettingsDialog
        setSettingsDialogOpen={setSettingsDialogOpen}
        settingsDialogOpen={settingsDialogOpen}
        openConvName={props.openConvName}
        setOpenConvName={props.setOpenConvName}
        allChannels={props.allChannels}
      />
      {
        succes ? <FlashMessage
          message={message} /> : ''
      }
    </div>
  );
};

export default Main;
