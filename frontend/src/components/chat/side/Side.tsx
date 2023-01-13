import ChannelDialog from "../channelDialog/ChannelDialog";
//
import "./Side.scss";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const Side = (props: {
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
    privacy: string;
    name: string;
    password: string;
    description: string;
    owner: string;
  }>;
  setAllChannels: Function;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [alignment, setAlignment] = useState("left");
  const [open, setOpen] = useState(false);
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="side">
      <div className="newConvContainer">
        <div
          className="newConvMessage"
          onClick={() => {
            if (props.newConvMessageBool) return;
            props.setOpenConvName("New Message");
            let tmpArray = [...props.allConv];

            tmpArray.unshift({
              receiver: "New Message",
              last_message_text: "",
              last_message_time: new Date(),
              new_conv: true,
            });
            props.setAllConv(tmpArray);
            props.setNewConvMessageBool(true);
          }}
        >
          <div className="newConvButtonText">New Message</div>
          <AddIcon className="newConvButton" />
        </div>
        <div
          className="newConvChannel"
          onClick={() => {
            if (props.newConvMessageBool) {
              let tmpArray = [...props.allConv];
              tmpArray.shift();
              props.setAllConv(tmpArray);
              props.setNewConvMessageBool(false);
              props.setOpenConvName("");
            }
            handleClickOpen();
            utils.socket.emit("GET_ALL_CHANNELS", user.user?.login);
            console.log("send GET_ALL_CHANNELS to back from", user.user?.login);
          }}
        >
          <div className="newConvButtonText">New Channel</div>
          <AddIcon className="newConvButton" />
        </div>
      </div>
      <ChannelDialog
        open={open}
        setOpen={setOpen}
        setOpenConvName={props.setOpenConvName}
        allChannels={props.allChannels}
        setAllChannels={props.setAllChannels}
        allConv={props.allConv}
        setAllConv={props.setAllConv}
      />
      <input
        className="searchBar"
        type="text"
        id="outlined-basic"
        placeholder="Research"
        value={inputValue}
        autoComplete={"off"}
        onChange={(event) => {


          let list = document.getElementById('listConv');

          if (list != null) {
            for (let i = 0; i < list.children.length; i++) {
              if (!event.currentTarget.value.length || list.children[i].children[1].children[0].textContent?.toUpperCase().indexOf(event.currentTarget.value.toUpperCase())! > -1)
                list.children[i].classList.remove('hidden')
              else
                list.children[i].classList.add('hidden')
            }
          }

          setInputValue(event.currentTarget.value);
        }}
        autoFocus
        onKeyDown={(event) => { }}
      />

      <div className="startedConv">
        <div id="listConv">
          {props.allConv.map((convInfo, index) => {
            return (
              <div
                className={
                  props.openConvName == convInfo.receiver
                    ? "activeStartedConvItem"
                    : "startedConvItem"
                }
                key={index.toString()}
                onClick={() => {
                  if (props.newConvMessageBool) {
                    let tmpArray = [...props.allConv];
                    tmpArray.shift();
                    props.setAllConv(tmpArray);
                    props.setNewConvMessageBool(false);
                  }
                  props.setOpenConvName(convInfo.receiver);
                }}
              >
                <Avatar className="sideAvatar" sx={{ bgcolor: grey[500] }}>
                  {convInfo.receiver[0]}
                </Avatar>
                <div className="startedConvText">
                  <div className="startedConvName">{convInfo.receiver}</div>
                  <div className="startedConvMessage">
                    {convInfo.last_message_text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Side;
