//
import "./Main.scss";
import { RootState } from "../../../state";
import ChannelSettingsDialog from "../channelSettingsDialog/ChannelSettingsDialog";
import UserProfileDialog from "../../userProfileDialog/UserProfileDialog";

//
import React, { useState, useEffect } from "react";
import {
  dividerClasses,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BlockIcon from "@mui/icons-material/Block";
import SettingsIcon from "@mui/icons-material/Settings";
import Person2Icon from "@mui/icons-material/Person2";
import { useSelector } from "react-redux";

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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  useEffect(() => {
    utils.socket.emit("GET_CONV", {
      sender: user.user?.username,
      receiver: props.openConvName,
    });
    console.log("send GET_CONV to back");
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
        privacy: string;
        name: string;
        password: string;
        description: string;
        owner: string;
      }>
    ) => {
      console.log("get_all_channels recu", user.user?.username, "with", data);
      props.setAllChannels([...data]);
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
                utils.socket.emit("CHECK_USER_EXIST", topInputValue);
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
                <IconButton
                  className="profileButton"
                  color="secondary"
                  style={{ color: "white", marginRight: "2%" }}
                  aria-label="upload picture"
                  component="label"
                  onClick={() => {
                    setProfileDialogOpen(true);
                  }}
                >
                  {/* <input hidden accept="image/*" type="file" /> */}
                  <Person2Icon />
                </IconButton>
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
                  onClick={() => {
                    utils.socket.emit("BLOCK_USER", {
                      login: user.user?.username,
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
        <div className="messagesDisplay" id="messagesDisplay">
          {convMessages.map((message, index) => {
            if (message.sender == user.user?.username)
              return (
                <div key={index.toString()} className="rightMessages">
                  {message.content}
                </div>
              );
            else if (message.sender == "___server___")
              return (
                <div key={index.toString()} className="serverMessagesContainer">
                  <div className="diviser" />
                  {message.content}
                  <div className="diviser" />
                </div>
              );
            else
              return (
                <div key={index.toString()} className="leftMessages">
                  <div className="messageSender">{message.sender + " : "}</div>
                  <div className="messageContent">{message.content}</div>
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
                    sender: user.user?.username,
                    receiver: props.openConvName,
                    content: inputValue,
                  });
                  console.log("send ADD_MESSAGE to back");
                  // utils.socket.emit("GET_CONV", {
                  //   sender: user.user?.username,
                  //   receiver: props.openConvName,
                  // });
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
      <UserProfileDialog
        profileDialogOpen={profileDialogOpen}
        setProfileDialogOpen={setProfileDialogOpen}
      />
    </div>
  );
};

export default Main;
