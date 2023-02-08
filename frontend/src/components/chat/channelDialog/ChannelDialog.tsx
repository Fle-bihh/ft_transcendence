//
import "./ChannelDialog.scss";
import { RootState } from "../../../state";

//
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  AppBar,
  Dialog,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import RemoveModeratorIcon from "@mui/icons-material/RemoveModerator";
import ShieldIcon from "@mui/icons-material/Shield";

const ChannelDialog = (props: {
  open: boolean;
  setOpen: Function;
  setOpenConvName: Function;
  allChannels: Array<{
    index: number;
    privacy: boolean;
    name: string;
    description: string;
    owner: string;
    password: boolean;
  }>;
  setAllChannels: Function;
  allConv: Array<{
    receiver: string;
    last_message_text: string;
    last_message_time: Date;
    new_conv: boolean;
  }>;
  setAllConv: Function;
}) => {
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [searchInputValue, setSearchInputValue] = useState("");
  const [passwordSwitchOn, setPasswordSwitchOn] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [channelNameInput, setChannelNameInput] = useState("");
  const [showJoinChannelPasswordModal, setShowJoinChannelPasswordModal] =
    useState(false);
  const [joinChannelSelect, setJoinChannelSelect] = useState("");
  const [joinChannelPasswordInput, setJoinChannelPasswordInput] = useState("");
  const [channelPasswordInput, setChannelPasswordInput] = useState("");
  const [alignment, setAlignment] = useState(false);

  const handleKeyDown = (event: any) => {
    if (event.key === "Escape") {
      setJoinChannelPasswordInput("");
      setShowJoinChannelPasswordModal(false);
      window.removeEventListener("keydown", handleKeyDown);
    }
  };

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: boolean | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  const handleClose = () => {
    setShowJoinChannelPasswordModal(false);
    props.setOpen(false);
    setPasswordSwitchOn(false);
    setChannelPasswordInput("");
    setChannelNameInput("");
    setDescriptionInput("");
    setSearchInputValue("");
    setJoinChannelSelect("");
  };

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
      }>
    ) => {
      console.log("get_all_channels recu", user.user?.username, "with", data);
      props.setAllChannels([...data]);
    }
  );

  utils.socket.removeListener("channel_joined");
  utils.socket.on("channel_joined", (data: { channelName: string }) => {
    setShowJoinChannelPasswordModal(false);
    props.setOpenConvName(data.channelName);
    handleClose();
  });

  return (
    <Dialog
      fullScreen
      open={props.open}
      onClose={handleClose}
      disableEscapeKeyDown={showJoinChannelPasswordModal}
    >
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
              let list = document.getElementById("listChannel");

              if (list != null) {
                for (let i = 0; i < list.children.length; i++) {
                  if (
                    !event.currentTarget.value.length ||
                    list.children[i].children[0].children[0].textContent
                      ?.toUpperCase()
                      .indexOf(event.currentTarget.value.toUpperCase())! > -1
                  ) {
                    list.children[i].classList.remove("hidden");
                    list.children[i].classList.add("flex");
                  } else {
                    list.children[i].classList.remove("flex");

                    list.children[i].classList.add("hidden");
                  }
                }
              }

              setSearchInputValue(event.currentTarget.value);
            }}
            autoFocus
          />
          <div className="channelsContainer" id="listChannel">
            {props.allChannels.map((channel) => {
              if (props.allConv.find((conv) => conv.receiver === channel.name))
                return <></>;
              return channel.privacy === false ||
                channel.name === searchInputValue ? (
                <div
                  className={
                    (joinChannelSelect === channel.name
                      ? "channelDataContainer active "
                      : "channelDataContainer inactive ") +
                    (channel.name
                      .toUpperCase()
                      .indexOf(searchInputValue.toUpperCase())! > -1
                      ? "flex"
                      : "hidden")
                  }
                  onClick={() => {
                    if (joinChannelSelect !== channel.name)
                      setJoinChannelSelect(channel.name);
                    else setJoinChannelSelect("");
                  }}
                >
                  <div className="channelTextDiv">
                    <div className="channelDataName">{channel.name}</div>
                    <div className="channelDataDescription">
                      {channel.description}
                    </div>
                  </div>
                  <div className="channelOtherDiv">
                    <div className="channelIcons">
                      {channel.privacy === true ? (
                        <VisibilityOffOutlinedIcon className="icon" />
                      ) : (
                        <></>
                      )}
                      {channel.password ? (
                        <ShieldIcon className="icon" />
                      ) : (
                        <RemoveModeratorIcon className="icon" />
                      )}
                    </div>
                    <div className="channelDataParticipants">0/50</div>
                  </div>
                  {/* {channel.password ? (
                      <div className="channelDataPasswordInput"></div>
                    ) : (
                      <div></div>
                    )} */}
                </div>
              ) : (
                <></>
              );
            })}
          </div>
          <button
            className="joinChannelButton"
            disabled={
              props.allChannels.find(
                (channel) => channel.name === joinChannelSelect
              ) === undefined
            }
            onClick={() => {
              if (
                props.allChannels.find(
                  (channel) => channel.name === joinChannelSelect
                )!.password
              ) {
                setShowJoinChannelPasswordModal(true);
                window.addEventListener("keydown", handleKeyDown);
              }
              utils.socket.emit("JOIN_CHANNEL", {
                username: user.user?.username,
                channelName: joinChannelSelect,
                channelPassword: joinChannelPasswordInput,
              });
            }}
          >
            Join this channel
          </button>
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
                defaultChecked={false}
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
          <div className="createChannelLastRaw">
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
            ></input>
            <div
              className="createChannelButton"
              onClick={() => {
                if (
                  props.allChannels.find(
                    (channel) => channel.name === channelNameInput
                  ) === undefined
                ) {
                  utils.socket.emit("CREATE_CHANNEL", {
                    privacy: alignment,
                    name: channelNameInput,
                    password: channelPasswordInput,
                    description: descriptionInput,
                    owner: user.user?.username,
                  });
                  console.log(
                    "send CREATE_CHANNEL to back from ",
                    user.user?.username
                  );
                  console.log(
                    "send ADD_MESSAGE to back from ",
                    user.user?.username
                  );
                }
                handleClose();
              }}
            >
              <div className="createChannelButtonTitle">Create</div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="joinChannelPasswordDialog"
        style={{ display: showJoinChannelPasswordModal ? "flex" : "none" }}
      >
        <input
          type="text"
          id="joinChannelInput"
          placeholder="Enter channel password"
          autoFocus
          onChange={(value) =>
            setJoinChannelPasswordInput(value.currentTarget.value)
          }
          value={joinChannelPasswordInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // if (
              //   props.allChannels.find(
              //     (channel) => channel.name === joinChannelSelect
              //   )!.password !== joinChannelPasswordInput
              // ) {
              //   document
              //     .getElementById("joinChannelInput")!
              //     .classList.add("error");
              //   const timeOut = setTimeout(() => {
              //     document
              //       .getElementById("joinChannelInput")!
              //       .classList.remove("error");
              //     clearTimeout(timeOut);
              //   }, 200);
              // }
              // // setShowJoinChannelPasswordModal(false);
              utils.socket.emit("JOIN_CHANNEL", {
                username: user.user?.username,
                channelName: joinChannelSelect,
                channelPassword: joinChannelPasswordInput,
              });
            }
          }}
        />
      </div>
    </Dialog>
  );
};

export default ChannelDialog;
