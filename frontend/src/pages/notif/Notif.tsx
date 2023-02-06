import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import Navbar from "../../components/nav/Nav";
import { actionCreators, RootState } from "../../state";
import { NotifType } from "../../state/type";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import "./Notif.scss";
import React, { useEffect, useState } from "react";
import { Button, DialogActions, DialogTitle, IconButton } from "@mui/material";
import Pong from "../pong/Pong";
import { Navigate, NavLink } from "react-router-dom";

export default function Notif() {
  const persistantReducer = useSelector(
    (state: RootState) => state.persistantReducer
  );
  const dispatch = useDispatch();
  const { addNotif, delNotif, seenAllNotif } = bindActionCreators(
    actionCreators,
    dispatch
  );
  const [lastNbNotif, setLastNbNotif] = useState(0);
  const [openGame, setOpenGame] = useState(false);
  const [roomId, setRoomId] = useState("");
  const utils = useSelector((state: RootState) => state.utils);

  useEffect(() => {
    seenAllNotif();
  }, []);

  const acceptInvitation = (data: {
    sender: string;
    gameMap: string;
    receiver: string;
  }) => {
    //send a socket to accept the gaaaaaame
    utils.gameSocket.emit("ACCEPT_GAME", data);
  };

  const declineInvitation = (data: {
    sender: string;
    gameMap: string;
    receiver: string;
  }) => {
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

  if (openGame && roomId != "")
    return (
      <Navigate
        to="/Pong"
        replace={true}
        state={{ invite: true, roomId: roomId }}
      />
    );
  return (
    <>
      <Navbar />
      <div className="notifContainer">
        {persistantReducer.notifReducer.notifArray.map((notif, index) => {
          switch (notif.type) {
            case NotifType.FRIENDREQUEST: {
              return (
                <div className="notifElement">
                  <div
                    className="notifCross"
                    onClick={() => {
                      delNotif(index);
                    }}
                  >
                    <CloseIcon />
                  </div>
                  <NavLink to={`/profileother?username=${notif.data.sender}`}>
                    <div className="notifTitle">Friend Request</div>
                    <div className="notifText">{`${notif.data.sender} send you a friend's request.`}</div>
                  </NavLink>
                </div>
              );
            }
            case NotifType.INVITEGAME: {
              return (
                // <div className="notifContainer">
                <div className="notifElement">
                  <div
                    className="notifCross"
                    onClick={() => {
                      declineInvitation(notif.data);
                      delNotif(index);
                    }}
                  >
                    <CloseIcon />
                  </div>
                  {/* <div className="notifTitle">Invitation to play</div> */}
                  <DialogTitle className="notifTitle">
                    Invitation to play
                  </DialogTitle>
                  <div className="notifText">{`${notif.data.sender} send you a invitation to play to the pong on the ${notif.data.gameMap}.`}</div>

                  <DialogActions>
                    <Button
                      className="notifAccept"
                      onClick={() => {
                        acceptInvitation(notif.data);
                        delNotif(index);
                      }}
                    >
                      Confirm
                    </Button>

                    {/* <div className="notifAccept" onClick={() => { acceptInvitation(notif.data); delNotif(index); }} > */}
                    {/* <DoneIcon />*/}
                    {/* </div> */}
                    <Button
                      className="notifDecline"
                      onClick={() => {
                        declineInvitation(notif.data);
                        delNotif(index);
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogActions>

                  {/* <div className="notifDecline" onClick={() => { declineInvitation(notif.data); delNotif(index); }} > */}
                  {/* <CloseIcon /> */}
                  {/* </div> */}

                  {/* </div> */}
                </div>
              );
            }
          }
        })}
      </div>

      <button
        onClick={() => {
          addNotif({
            type: NotifType.FRIENDREQUEST,
            data: {
              sender: "Felix",
            },
          });
        }}
      >
        Oui
      </button>
    </>
  );
}
