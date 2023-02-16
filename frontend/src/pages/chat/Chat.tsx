import Navbar from "../../components/nav/Nav";
import Main from "../../components/chat/main/Main";
import Side from "../../components/chat/side/Side";
import "./Chat.scss";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";

const Chat = () => {
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [allConv, setAllConv] = useState(
    Array<{
      receiver: string;
      last_message_text: string;
      last_message_time: Date;
      new_conv: boolean;
    }>()
  );
  const [allChannels, setAllChannels] = useState(
    Array<{
      index: number;
      privacy: boolean;
      name: string;
      description: string;
      owner: string;
      password: boolean;
    }>
  );
  const [openConvName, setOpenConvName] = useState("");
  const [launchChatBool, setLaunchChatBool] = useState(true);
  const [newConvMessageBool, setNewConvMessageBool] = useState(false);

  useEffect(() => {
    if (!allConv.length && launchChatBool) {
      utils.socket.emit("GET_ALL_CONV_INFO", { sender: user.user?.username });
      utils.socket.emit("GET_ALL_USERS");
    }
    setLaunchChatBool(false);
  },[allConv.length, launchChatBool, utils.socket, user.user?.username]);

  utils.socket.removeListener("get_all_conv_info");
  utils.socket.on(
    "get_all_conv_info",
    (
      data: Array<{
        receiver: string;
        last_message_text: string;
        last_message_time: Date;
        new_conv: boolean;
      }>
    ) => {
      let tmp = [...data];

      setAllConv(
        tmp
      );
    }
  );

  utils.socket.removeListener("new_message");
  utils.socket.on("new_message", () => {
    utils.socket.emit("GET_ALL_CONV_INFO", { sender: user.user?.username });
  });

  utils.socket.removeListener("channel_name_change");
  utils.socket.on("channel_name_change", (data: {channelName: string}) => {
    utils.socket.emit("GET_ALL_CHANNELS", { login: user.user?.username });
    setOpenConvName(data.channelName)
  });

  return (
    <div className="chat">
      <div className="navSpace"></div>
      <Navbar />

      <div className="chatPage">
        <Side
          openConvName={openConvName}
          setOpenConvName={setOpenConvName}
          allConv={allConv}
          setAllConv={setAllConv}
          newConvMessageBool={newConvMessageBool}
          setNewConvMessageBool={setNewConvMessageBool}
          allChannels={allChannels}
          setAllChannels={setAllChannels}
        />
        {openConvName ? (
          <Main
            openConvName={openConvName}
            setOpenConvName={setOpenConvName}
            allConv={allConv}
            setAllConv={setAllConv}
            newConvMessageBool={newConvMessageBool}
            setNewConvMessageBool={setNewConvMessageBool}
            allChannels={allChannels}
            setAllChannels={setAllChannels}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Chat;
