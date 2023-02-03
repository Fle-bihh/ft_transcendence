import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import Navbar from "../../components/nav/Nav";
import { actionCreators, RootState } from "../../state";
import { NotifType } from "../../state/type";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from '@mui/icons-material/Done';
import "./Notif.scss";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";

export default function Notif() {
  const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
  const dispatch = useDispatch();
  const { addNotif, delNotif, seenAllNotif } = bindActionCreators(actionCreators, dispatch);
  const [lastNbNotif, setLastNbNotif] = useState(0);
  const utils = useSelector((state: RootState) => state.utils);

  useEffect(() => { 
    seenAllNotif()
  }, []);

  const acceptInvitation = (data : {sender : string, gameMap : string, receiver : string}) => {
    //send a socket to accept the gaaaaaame
    utils.gameSocket.emit('ACCEPT_GAME', data);
  }

  const declineInvitation = (data : {sender : string, gameMap : string, receiver : string}) => {
    //send a socket to decline the gaaaaaame
    utils.gameSocket.emit('DECLINE_GAME', data);
  }

  return (
    <>
      <Navbar />
      <div className="notifContainer">
        {persistantReducer.notifReducer.notifArray.map((notif, index) => {
          switch (notif.type) {
            case NotifType.FRIENDREQUEST: {
              return (
                <div className="notifElement">
                  <div className="notifCross" onClick={() => { delNotif(index); }}>
                    <CloseIcon />
                  </div>
                  <div className="notifTitle">Friend Request</div>
                  <div className="notifText">{`${notif.data.sender} send you a friend's request.`}</div>
                </div>
              );
            }
            case NotifType.INVITEGAME: {
              return (
                <div className="notifElement">
                  <div className="notifCross" onClick={() => { declineInvitation(notif.data); delNotif(index); }} >
                    <CloseIcon />
                  </div>
                  <div className="notifTitle">Invitation to play</div>
                  <div className="notifText">{`${notif.data.sender} send you a invitation to play to the pong on the ${notif.data.gameMap}.`}</div>
                  <div className="notifAccept" onClick={() => { acceptInvitation(notif.data); delNotif(index);}} >
                    <DoneIcon />
                  </div>
                  <div className="notifDecline" onClick={() => { declineInvitation(notif.data); delNotif(index);}} >
                    <CloseIcon />
                  </div>
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
