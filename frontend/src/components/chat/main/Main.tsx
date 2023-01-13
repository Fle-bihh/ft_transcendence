//
import "./Main.scss";
// import Switch from "../switch/Switch";
import { RootState } from "../../../state";

//
import React, { useState, useEffect } from "react";
import {
  dividerClasses,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import VolumeMuteIcon from "@mui/icons-material/VolumeMute";
import BlockIcon from "@mui/icons-material/Block";
import { useSelector } from "react-redux";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import RemoveModeratorOutlinedIcon from "@mui/icons-material/RemoveModeratorOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

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
  allUsers: Array<{ id: number; login: string }>;
  setAllUsers: Function;
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
  const [convMessages, setConvMessages] = useState(
    Array<{
      id: number;
      sender: string;
      receiver: string;
      content: string;
      time: Date;
    }>()
  );
  const [inputValue, setInputValue] = useState("");
  const [topInputValue, setTopInputValue] = useState("");
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  useEffect(() => {
    if (
      !props.allChannels.find((channel) => channel.name === props.openConvName)
    ) {
      utils.socket.emit("GET_CONV", {
        sender: user.user?.login,
        receiver: props.openConvName,
      });
      console.log("send GET_CONV to back");
    }
  }, [props.openConvName, props.allConv]);

  useEffect(() => {
    if (
      props.allChannels.find((channel) => channel.name === props.openConvName)
    ) {
      utils.socket.emit("GET_CHANNEL", {
        sender: user.user?.login,
        receiver: props.openConvName,
      });
      console.log("send GET_CHANNEL to back from", user.user?.login);
    }
  }, [props.openConvName, props.allConv]);

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
      }>
    ) => {
      console.log("get_conv recu front", openConv);
      const sorted = openConv.sort((a, b) => a.id - b.id);
      setConvMessages(sorted);
    }
  );

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
              if (event.key == "Enter") {
                if (
                  props.allUsers.find((user) => user.login === topInputValue)
                ) {
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
              }
            }}
          ></input>
        </div>
      ) : (
        <div className="mainTitleContainer">
          <div className="mainTitle">To :</div>
          <div>{props.openConvName}</div>
          <div className="buttons">
            <IconButton
              className="startGameButton"
              color="secondary"
              style={{ color: "white", marginRight: "2%" }}
              aria-label="upload picture"
              component="label"
            >
              {/* <input hidden accept="image/*" type="file" /> */}
              <SportsEsportsIcon />
            </IconButton>
            <IconButton
              className="blockButton"
              color="secondary"
              style={{ color: "white", marginRight: "2%" }}
              aria-label="upload picture"
              component="label"
              onClick={() => {utils.socket.emit('BLOCK_USER', {
                login: user.user?.login,
                target: props.openConvName
              })
              console.log('send BLOCK_USER to back from', user.user?.login)
            }}
            >
              {/* <input hidden accept="image/*" type="file" /> */}
              <BlockIcon />
            </IconButton>
          </div>
        </div>
      )}
      <div className="messagesContainer">
        <div className="messagesDisplay" id="messagesDisplay">
          {convMessages.map((message, index) => {
            if (message.sender == user.user?.login)
              return (
                <div key={index.toString()} className="rightMessages">
                  {message.content}
                </div>
              );
            else
              return (
                <div key={index.toString()} className="leftMessages">
                  {message.content}
                </div>
              );
          })}
          {/* <!-- messages go here --> */}
          {/* <Messages messages={messages} onClick={() => setMobile(false)} loading={loading} /> */}
        </div>
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
                if (event.key == "Enter") {
                  utils.socket.emit("ADD_MESSAGE", {
                    sender: user.user?.login,
                    receiver: props.openConvName,
                    content: inputValue,
                  });
                  console.log("send ADD_MESSAGE to back");
                  utils.socket.emit("GET_CONV", {
                    sender: user.user?.login,
                    receiver: props.openConvName,
                  });
                  console.log("send GET_CONV to back");
                  setInputValue("");
                }
              }}
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default Main;
