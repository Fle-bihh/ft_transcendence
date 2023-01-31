import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import Navbar from "../../components/nav/Nav";
import { actionCreators, RootState } from "../../state";
import { NotifType } from "../../state/type";
import CloseIcon from "@mui/icons-material/Close";

import "./Notif.scss";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";

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

  useEffect(() => {
	seenAllNotif()
  }, []);

  const acceptInvitation = (mapID : string) => {
//send a socket to accept the gaaaaaame
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
                  <div
                    className="notifCross"
                    onClick={() => {
                      delNotif(index);
                    }}
                  >
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
                  <div className="notifCross" onClick={() => { delNotif(index); }} >
                    <CloseIcon />
                  </div>
                  <div className="notifTitle">Invitation to play</div>
                  <div className="notifText">{`${notif.data.sender} send you a invitation to play to the pong on the map ${notif.data.mapName}.`}</div>
                  <div className="notifAccept" onClick={() => { acceptInvitation(notif.data.mapID); }} >
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
