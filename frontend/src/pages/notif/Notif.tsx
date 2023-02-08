import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import Navbar from "../../components/nav/Nav";
import { actionCreators, RootState } from "../../state";
import { NotifType } from "../../state/type";
import CloseIcon from "@mui/icons-material/Close";
import "./Notif.scss";
import React, { useState } from "react";
import { Button, DialogActions, DialogTitle } from "@mui/material";
import { Navigate, NavLink } from "react-router-dom";

export default function Notif() {
  const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
  const dispatch = useDispatch();
  const { delNotif, removeNotifPong } = bindActionCreators(actionCreators, dispatch);
  const [openGame, setOpenGame] = useState(false);
  const [roomId, setRoomId] = useState("");
  const utils = useSelector((state: RootState) => state.utils);

  const acceptInvitation = (data: { sender: string; gameMap: string; receiver: string; }) => {
    //send a socket to accept the gaaaaaame
    utils.gameSocket.emit("ACCEPT_GAME", data);
    removeNotifPong();
  };

  const declineInvitation = (data: { sender: string; gameMap: string; receiver: string; }) => {
    //send a socket to decline the gaaaaaame
    utils.gameSocket.emit("DECLINE_GAME", data);
  };

  utils.gameSocket.removeListener("redirect_to_game");
  utils.gameSocket.on(
    "redirect_to_game",
    (data: { sender: string; gameMap: string; receiver: string }) => {
      console.log("room name : ", data.sender + data.receiver);
      utils.gameSocket.emit("JOIN_ROOM", data.sender + data.receiver);
      utils.gameSocket.emit("START_INVITE_GAME", {
        user: { login: persistantReducer.userReducer.user?.username },
        gameMap: data.gameMap,
        roomId: data.sender + data.receiver,
      });
      setRoomId(data.sender + data.receiver);
      setOpenGame(true);
    }
  );

  utils.socket.removeListener("check_user_exist");

  utils.socket.on("check_user_exist", (data: {exist: boolean, username: string}) => {
    console.log('check_user_exist received front', data.exist);
    if (!data.exist) {
      persistantReducer.notifReducer.notifArray.forEach((notif, index) => {
        console.log('notif.data.sender = ', notif.data.sender)
        if (notif.type === NotifType.FRIENDREQUEST && notif.data.sender === data.username) {
          delNotif(index);
        }
      })
    }
  });

  if (openGame && roomId !== "")
    return (
      <Navigate to="/Pong" replace={true} state={{ invite: true, roomId: roomId }} />
    );
  return (
    <>
      <Navbar />
      <div className="notifContainer">
        {persistantReducer.notifReducer.notifArray.length ? (persistantReducer.notifReducer.notifArray.map((notif, index) => {
          switch (notif.type) {
            case NotifType.FRIENDREQUEST: {
              utils.socket.emit('CHECK_USER_EXIST', {username: notif.data.sender});
              console.log('send CHECK_USER_EXIST to back');
              return (
                <div className="notifElement" key={index}>
                  <div
                    className="notifCross"
                    onClick={() => {
                      delNotif(index);
                    }} >
                    <CloseIcon />
                  </div>
                  <DialogTitle className="notifTitle">
                    {notif.data.sender}
                  </DialogTitle>
                  <div className="notifText">
                    sent you a friend's request
                  </div>
                  <DialogActions onClick={() => {delNotif(index)}}>
                    <Button className="notifAccept">
                      <NavLink to={`/profileother?username=${notif.data.sender}`} className="notifFriend">Look my send friend's request</NavLink>
                    </Button>
                  </DialogActions>
                </div>
              );
            }
            case NotifType.INVITEGAME: {
              return (
                <div className="notifElement" key={index}>
                  <div className="notifCross" onClick={() => { declineInvitation(notif.data); delNotif(index); }}>
                    <CloseIcon />
                  </div>
                  <DialogTitle className="notifTitle">
                    Invitation to play
                  </DialogTitle>
                  <div className="notifText">{`${notif.data.sender} send you a invitation to play to the pong on the ${notif.data.gameMap}.`}</div>
                  <DialogActions>
                    <Button className="notifAccept" onClick={() => { acceptInvitation(notif.data); delNotif(index); }}>
                      Confirm
                    </Button>
                    <Button className="notifDecline" onClick={() => { declineInvitation(notif.data); delNotif(index); }}>
                      Cancel
                    </Button>
                  </DialogActions>
                </div>
              );
            }
            default: {
              return (<></>)
            }
          }
        })) : (
          <h1 className="no_notif">You have no notification</h1>
        )}
      </div>
    </>
  );
}
