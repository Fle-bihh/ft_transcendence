//
import "./ChannelDialog.scss";
import { RootState } from "../../../state";

//
import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import { deepPurple, grey, red } from "@mui/material/colors";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import { TransitionProps } from "@mui/material/transitions";
import {
  AppBar,
  Button,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
  Tooltip,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const ChannelDialog = (props: {
  open: boolean;
  setOpen: Function;
  setOpenConvName: Function;
  allChannels: Array<{
    index: number;
    privacy: string;
    name: string;
    password: string;
    description: string;
    owner: string;
  }>;
  setAllChannels: Function;
}) => {
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [searchInputValue, setSearchInputValue] = useState("");
  const [passwordSwitchOn, setPasswordSwitchOn] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [channelNameInput, setChannelNameInput] = useState("");
  const [channelPasswordInput, setChannelPasswordInput] = useState("");
  const [alignment, setAlignment] = useState("left");

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  const handleClickOpen = () => {
    props.setOpen(true);
    setAlignment("left");

    // setPasswordSwitchOn(false);
    // setCreateSwitchOn(false);
    // setChannelPasswordInput("");
    // setChannelNameInput("");
    // setDescriptionInput("");
  };

  const handleClose = () => {
    props.setOpen(false);
    setPasswordSwitchOn(false);
    setChannelPasswordInput("");
    setChannelNameInput("");
    setDescriptionInput("");
  };

  useEffect(() => {
    if (!window.open) return;
    utils.socket.emit("GET_ALL_CHANNELS", user.user?.login);
    console.log("send GET_ALL_CHANNELS to back from", user.user?.login);
  }, [window.open]);

  utils.socket.removeListener("get_all_channels");
  utils.socket.on(
    "get_all_channels",
    (
      data: Array<{
        index: number;
        privacy: string;
        name: string;
        password: string;
        description: string;
        owner: string;
      }>
    ) => {
      console.log("get_all_channels recu", user.user?.login, "with", data);
      props.setAllChannels([...data]);
    }
  );

  return (
    <Dialog fullScreen open={props.open} onClose={handleClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <div className="newChannelDialogContent">
        <div className="joinChannelContainer">
          <div className="joinChannelTitle">Join Channel</div>
          <input
            className="searchBar"
            type="text"
            id="outlined-basic"
            placeholder="Research"
            value={searchInputValue}
            autoComplete={"off"}
            onChange={(event) => {
              setSearchInputValue(event.currentTarget.value);
            }}
            autoFocus
            onKeyDown={(event) => {}}
          />
          <div className="channelsContainer">
            {props.allChannels.map((channel) => {
              return channel.privacy === "public" ||
                channel.name === searchInputValue ? (
                <div className="channelDataContainer">
                  <div className="channelDataName">{channel.name}</div>
                  <div className="channelDataDescription">
                    {channel.description}
                  </div>
                  <div className="channelDataParticipants">0/50</div>
                  {channel.password ? (
                    <div className="channelDataPasswordInput"></div>
                  ) : (
                    <div></div>
                  )}
                  <div
                    className="joinChannelButton"
                    onClick={() => {
                      utils.socket.emit("ADD_PARTICIPANT", {
                        login: user.user?.login,
                        channel: channel.name,
                        admin: false,
                      });
                      console.log(
                        "send ADD_PARTICIPANT to back from ",
                        user.user?.login
                      );
                      console.log("channel: ", channel.name);
                      props.setOpenConvName(channel.name);
                      const newParticipantMsg =
                        user.user?.login + " joined this Channel";
                      utils.socket.emit("ADD_MESSAGE", {
                        sender: user.user?.login,
                        receiver: channel.name,
                        content: newParticipantMsg,
                      });
                      console.log(
                        "send ADD_MESSAGE to back from ",
                        user.user?.login
                      );
                      handleClose();
                    }}
                  >
                    Join this channel
                  </div>
                </div>
              ) : (
                <div></div>
              );
            })}
          </div>
        </div>

        <div className="createChannelContainer">
          <div className="createChannelTitle">Create channel</div>

          <div className="createChannelParameter">
            <input
              className="createChannelInput"
              type="text"
              id="outlined-basic"
              placeholder="Channel Name"
              value={channelNameInput}
              autoComplete={"off"}
              onChange={(event) => {
                setChannelNameInput(event.currentTarget.value);
              }}
              autoFocus
            />
            <div className="channelPrivacy">
              {/* <div className="channelPrivacyTitle">Visibility :</div> */}
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleAlignment}
                aria-label="text alignment"
                color="primary"
                className="channelPrivacyToggleButton"
              >
                <ToggleButton value="public" aria-label="left aligned">
                  <Tooltip title="Public">
                    <VisibilityOutlinedIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="private" aria-label="centered">
                  <Tooltip title="Private">
                    <VisibilityOffOutlinedIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
          <div className="createChannelParameter">
            <Tooltip
              title={
                passwordSwitchOn
                  ? "Enter password"
                  : "No password is accepted for this channel"
              }
            >
              <input
                className="createChannelInput"
                type="text"
                id="outlined-basic"
                placeholder={"Channel Password"}
                value={channelPasswordInput}
                autoComplete={"off"}
                onChange={(event) => {
                  setChannelPasswordInput(event.currentTarget.value);
                }}
                autoFocus
                disabled={!passwordSwitchOn}
              ></input>
            </Tooltip>
            <div className="createChannelSwitch">
              <Switch
                value={passwordSwitchOn}
                onChange={() => {
                  setPasswordSwitchOn(!passwordSwitchOn);
                  if (passwordSwitchOn) setChannelPasswordInput("");
                }}
              />
            </div>
          </div>
          <input
            className="descriptionInput"
            type="text"
            id="outlined-basic"
            placeholder="Channel Description"
            value={descriptionInput}
            autoComplete={"off"}
            onChange={(event) => {
              setDescriptionInput(event.currentTarget.value);
            }}
            autoFocus
          ></input>
          <div
            className="createChannelButton"
            onClick={() => {
              utils.socket.emit("CREATE_CHANNEL", {
                privacy: alignment,
                name: channelNameInput,
                password: channelPasswordInput,
                description: descriptionInput,
                owner: user.user?.login,
              });
              console.log(
                "send CREATE_CHANNEL to back from ",
                user.user?.login
              );
              const newParticipantMsg =
                user.user?.login + " created this Channel";
              utils.socket.emit("ADD_MESSAGE", {
                sender: user.user?.login,
                receiver: channelNameInput,
                content: newParticipantMsg,
              });
              console.log("send ADD_MESSAGE to back from ", user.user?.login);
              console.log("privacy: ", alignment);
              console.log("name: ", channelNameInput);
              console.log("password: ", channelPasswordInput);
              console.log("description: ", descriptionInput);
              handleClose();
            }}
          >
            Create
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ChannelDialog;
