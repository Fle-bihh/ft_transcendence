//
import "./ChannelSettingsDialog.scss";
import { RootState } from "../../../state";

//
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Dialog,  Typography} from "@mui/material";
import { NavLink } from "react-router-dom";

const ChannelSettingsDialog = (props: {
  settingsDialogOpen: boolean;
  setSettingsDialogOpen: Function;
  openConvName: string;
  setOpenConvName: Function;
  allChannels: Array<{
    index: number;
    privacy: boolean;
    name: string;
    description: string;
    owner: string;
    password: boolean;
  }>;
}) => {
  const [nameInputValue, setNameInputValue] = useState("");
  const [passwordInputValue, setPasswordInputValue] = useState("");
  const [nameSecurityDialog, setNameSecurityDialog] = useState(false);
  const [passwordSecurityDialog, setPasswordSecurityDialog] = useState(false);
  const [participantRole, setParticipantRole] = useState("");
  const [participants, setParticipants] = useState( Array<{ username: string; admin: boolean; }>()
  );
  const utils = useSelector((state: RootState) => state.utils);
  const user = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );

  const handleClose = () => {
    props.setSettingsDialogOpen(false);
    setNameInputValue("");
    setPasswordInputValue("");
  };

  const handleCloseSecuName = () => {
    setNameSecurityDialog(false);
  };

  const handleCloseSecuPassword = () => {
    setPasswordSecurityDialog(false);
  };

  useEffect(() => {
    utils.socket.emit("GET_PARTICIPANT_ROLE", {
      username: user.user?.username,
      channel: props.openConvName,
    });
    utils.socket.emit("GET_PARTICIPANTS", {
      username: user.user?.username,
      channel: props.openConvName,
    });
  }, [
    props.settingsDialogOpen,
    props.openConvName,
    utils.socket,
    user.user?.username,
  ]);

  utils.socket.removeListener("channel_left");
  utils.socket.on("channel_left", (data: { channelName: string }) => {
    props.setSettingsDialogOpen(false);
    props.setOpenConvName("");
    handleClose();
  });

  utils.socket.removeListener("get_participant_role");
  utils.socket.on("get_participant_role", (data: { role: string }) => {
    setParticipantRole(data.role);
  });

  utils.socket.removeListener("get_participants");
  utils.socket.on(
    "get_participants",
    (
      data: Array<{
        username: string;
        admin: boolean;
      }>
    ) => {
      setParticipants([...data]);
    }
  );

  return (
    <Dialog
      className="channelSettingsDialog"
      open={props.settingsDialogOpen}
      onClose={handleClose}
      fullScreen
    >
      <div className="rawContainer">
        {participantRole === "owner" ? (
          <div className="firstRaw">
            <div className="changeChannelName">
              <input
                type="text"
                placeholder="Change Name"
                className="changeChannelNameInput"
                id="outlined-basic"
                value={nameInputValue}
                autoComplete={"off"}
                onChange={(event) => {
                  setNameInputValue(event.currentTarget.value);
                }}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") setNameSecurityDialog(true);
                }}
              />
            </div>
            <div className="changeChannelPassword">
              <input
                type="text"
                placeholder="Change Password"
                className="changeChannelPasswordInput"
                id="outlined-basic"
                value={passwordInputValue}
                autoComplete={"off"}
                onChange={(event) => {
                  setPasswordInputValue(event.currentTarget.value);
                }}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") setPasswordSecurityDialog(true);
                }}
              />
            </div>
          </div>
        ) : (
          <div></div>
        )}

        {participantRole !== "participant" ? (
          <div className="secondRaw">
            <div className="participantsList">
              <div className="participantsContainer">
                {participants.map((participant, index) => {
                  if (participant.username !== user.user?.username) {
                      return (
                        <div key={index} className="participantItemContainer">
                          <div className="participantName">
                            {participant.username}
                          </div>
                          {participantRole === "owner" ? (
                            <div className={participant.admin ? "adminButton" : "notAdminButton"}
                              onClick={() => {
                                if (!participant.admin) {
                                  utils.socket.emit("ADD_ADMIN", { new_admin: participant.username, channel: props.openConvName, });
                                  handleClose();
                                } else {
                                  utils.socket.emit("REMOVE_ADMIN", { new_admin: participant.username, channel: props.openConvName });
                                  handleClose();
                                }
                              }}>
                              <div className="content">ADMIN</div>
                            </div>
                          ) : (
                            <div></div>
                          )}
                          <div
                            className="muteButton"
                            onClick={() => {
                              if (1) {
                                utils.socket.emit("MUTE_USER", {
                                  user: participant.username,
                                  channel: props.openConvName,
                                });
                                handleClose();
                              }
                            }}
                          >
                            <div className="content">MUTE</div>
                          </div>
                          <div
                            className="banButton"
                            onClick={() => {
                              if (1) {
                                utils.socket.emit("BAN_USER", {
                                  user: participant.username,
                                  channel: props.openConvName,
                                });
                                handleClose();
                              }
                            }}
                          >
                            <div className="content">BAN</div>
                          </div>
                          {participantRole === "owner" ? (
                            <div
                              className="kickButton"
                              onClick={() => {
                                if (1) {
                                  utils.socket.emit("KICK_USER", {
                                    user: participant.username,
                                    channel: props.openConvName,
                                  });
                                  handleClose();
                                }
                              }}
                            >
                              <div className="content">KICK</div>
                            </div> 
                          ) : (
                            <div></div>
                          )}
                        </div>
                      );
                  }
                  return <div key={index}> </div>;
                })}
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
        <div
          className="leaveChannel"
          onClick={() => {
            utils.socket.emit("LEAVE_CHANNEL", {
              login: user.user?.username,
              channelName: props.openConvName,
            });
            handleClose();
          }}
        >
          <div className="leaveChannelText">Leave This Channel</div>

        </div>

        <Button
         onClick={() => {
          handleClose();
         }}
          >
        Return chat
        </Button>

  
      </div>
      <Dialog open={nameSecurityDialog} onClose={handleCloseSecuName}>
        <div className="securityText">Are you sure ?</div>
        <Button
          className="yesButton"
          onClick={() => {
            utils.socket.emit("CHANGE_CHANNEL_NAME", {
              login: user.user?.username,
              currentName: props.openConvName,
              newName: nameInputValue,
            });
            props.setOpenConvName(nameInputValue);
            handleCloseSecuName();
            handleClose();
          }}
        >
          Yes
        </Button>
        <Button className="noButton" onClick={handleCloseSecuName}>
          No
        </Button>
      </Dialog>
      <Dialog open={passwordSecurityDialog} onClose={handleCloseSecuPassword}>
        <div className="securityText">Are you sure ?</div>
        <div
          className="yesButton"
          onClick={() => {
            utils.socket.emit("CHANGE_CHANNEL_PASSWORD", {
              login: user.user?.username,
              channelName: props.openConvName,
              newPassword: passwordInputValue,
            });
            handleCloseSecuPassword();
            handleClose();
          }}
        >
          Yes
        </div>
        <div className="noButton" onClick={handleCloseSecuPassword}>
          No
        </div>
      </Dialog>
    </Dialog>
  );
};

export default ChannelSettingsDialog;
