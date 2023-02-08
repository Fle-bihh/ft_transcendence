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
      password: string;
      description: string;
      owner: string;
    }>
  );
  const [openConvName, setOpenConvName] = useState("");
  const [launchChatBool, setLaunchChatBool] = useState(true);
  const [newConvMessageBool, setNewConvMessageBool] = useState(false);

  useEffect(() => {
    if (!allConv.length && launchChatBool) {
      utils.socket.emit("GET_ALL_CONV_INFO", { sender: user.user?.username });
      console.log("send GET_ALL_CONV_INFO to back");
      utils.socket.emit("UPDATE_USER_SOCKET", { login: user.user?.username });
      console.log("send UPDATE_USER_SOCKET to back");
      utils.socket.emit("GET_ALL_USERS");
      console.log("send GET_ALL_USERS to back");
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
      console.log("get_all_conv_info recu front with", data);
    }
  );

  utils.socket.removeListener("new_message");
  utils.socket.on("new_message", () => {
    console.log("new_message recu front");
    utils.socket.emit("GET_ALL_CONV_INFO", { sender: user.user?.username });
    console.log("send GET_ALL_CONV_INFO to back");
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
